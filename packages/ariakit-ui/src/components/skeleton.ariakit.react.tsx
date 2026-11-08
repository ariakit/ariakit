import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { cx, splitProps } from "clava";
import * as React from "react";
import { usePerceptibleValue } from "../react-utils/use-perceptible-value.react.ts";
import {
  skeleton,
  skeletonBox,
  skeletonCircle,
  skeletonFill,
  skeletonLine,
  skeletonReveal,
} from "../styles/skeleton.ts";

/**
 * The state of a skeleton area:
 * - `pending`: loading, but the placeholders are not shown yet. Parts keep
 *   their space without painting.
 * - `skeleton`: the placeholders are shown.
 * - `content`: the content loaded. Parts render their children, or replace
 *   their placeholders with them row by row.
 */
export type SkeletonState = "pending" | "skeleton" | "content";

// A reveal follows the skeleton state. The content has loaded, and the parts
// replace their placeholders one row at a time, from the top.
type SkeletonPhase = SkeletonState | "reveal";

interface SkeletonStatus {
  phase: SkeletonPhase;
  // The last row that shows content during a reveal. Before the root measures
  // the rows, it is -1, and all parts still show placeholders.
  step: number;
  // The reveal row of each part, by part id.
  rows: Map<string, number> | null;
}

interface SkeletonPartContextValue {
  status: SkeletonStatus;
  // The placeholder elements of the parts, by part id. Parts in a portal
  // register here too, so the root does not query its own DOM.
  parts: Map<string, HTMLElement>;
}

const SkeletonContext = React.createContext<SkeletonState | null>(null);
const SkeletonPartContext =
  React.createContext<SkeletonPartContextValue | null>(null);

// Time between two rows of a reveal, and the longest time from the first row to
// the last. Rows a screen height apart take the longest time.
const REVEAL_STEP = 80;
const REVEAL_SPREAD = 320;
// Matches --animate-ui-skeleton-reveal.
const REVEAL_DURATION = 200;
// The reveal row of parts off the screen.
const OFFSCREEN_ROW = -1;

/**
 * Returns the state of the closest `Skeleton`, or `content` outside of one. Use
 * it for content that is not inside a skeleton part.
 * @example
 * function SaveButton() {
 *   const state = useSkeletonState();
 *   return <Button disabled={state !== "content"}>Save</Button>;
 * }
 */
export function useSkeletonState() {
  return React.useContext(SkeletonContext) ?? "content";
}

function getNextStatus(
  status: SkeletonStatus,
  state: SkeletonState,
): SkeletonStatus {
  const { phase } = status;
  if (state === "content") {
    if (phase === "skeleton") {
      return { phase: "reveal", step: -1, rows: null };
    }
    if (phase === "reveal") {
      return status;
    }
  }
  if (phase === state) {
    return status;
  }
  // Other changes apply at once, including content that loads before the
  // placeholders show.
  return { phase: state, step: -1, rows: null };
}

// A skeleton fill generates no box, so its child stands for it.
function getPartRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (rect.width || rect.height) {
    return rect;
  }
  return element.firstElementChild?.getBoundingClientRect() ?? rect;
}

function prefersReducedMotion(element: HTMLElement) {
  const win = getWindow(element);
  return win.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Groups the parts into reveal rows by their distance from the topmost visible
// part. Parts off the screen show their children with the first row, without a
// fade, since nobody sees them fade.
function getRevealRows(
  parts: Map<string, HTMLElement>,
  viewportHeight: number,
) {
  const rows = new Map<string, number>();
  const tops = new Map<string, number>();
  let first = Number.POSITIVE_INFINITY;
  if (viewportHeight <= 0) {
    return rows;
  }
  for (const [id, element] of parts) {
    const rect = getPartRect(element);
    const hidden = rect.bottom <= 0 || rect.top >= viewportHeight;
    if (hidden) {
      rows.set(id, OFFSCREEN_ROW);
      continue;
    }
    tops.set(id, rect.top);
    first = Math.min(first, rect.top);
  }
  for (const [id, top] of tops) {
    // A part joins the last row that starts before its delay.
    const distance = Math.min((top - first) / viewportHeight, 1);
    rows.set(id, Math.floor((distance * REVEAL_SPREAD) / REVEAL_STEP));
  }
  return rows;
}

export interface SkeletonProps
  extends ak.RoleProps<"div">, VariantProps<typeof skeleton> {
  /**
   * Whether the content is loading. The placeholders stay for at least 200
   * milliseconds, so fast loads do not flash.
   * @default true
   */
  loading?: boolean;
  /**
   * Milliseconds to wait after loading starts before the placeholders fade in.
   * Loading that ends within this time never shows them. With `0`, the
   * placeholders render with the first render, including the server HTML.
   * @default 0
   */
  delay?: number;
}

/**
 * Renders a loading area for skeleton parts. The parts show placeholders while
 * `loading` is `true`, and their children when it is `false`. When loading
 * ends, the children fade in where the placeholders were, one row at a time
 * from the top. Add `aria-busy` and a status message to the region that loads.
 * The animation also reaches the parts of nested roots, so nested roots should
 * use the same `$animate`.
 * @example
 * <Skeleton loading={!user}>
 *   <SkeletonCircle className="size-10">
 *     <img src={user?.avatar} alt="" className="size-10 rounded-full" />
 *   </SkeletonCircle>
 *   <SkeletonLine className="w-32">{user?.name}</SkeletonLine>
 * </Skeleton>
 */
export function Skeleton({
  loading = true,
  delay = 0,
  ref,
  ...props
}: SkeletonProps) {
  const [variantProps, rest] = splitProps(props, skeleton);
  const shown = usePerceptibleValue(loading, {
    delay: loading ? delay : 0,
    // Only the placeholders stay for a minimum. Content that stays would show
    // blank pending parts when the next load starts right after it.
    minDuration: loading ? 200 : 0,
    // A delay starts from the pending state, so a fast load on mount never
    // shows the placeholders.
    initialValue: delay > 0 ? false : loading,
  });
  const state = shown ? "skeleton" : loading ? "pending" : "content";
  const [status, setStatus] = React.useState<SkeletonStatus>(() => ({
    phase: state,
    step: -1,
    rows: null,
  }));
  const nextStatus = getNextStatus(status, state);
  if (nextStatus !== status) {
    setStatus(nextStatus);
  }

  const [parts] = React.useState(() => new Map<string, HTMLElement>());
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(ref, rootRef);
  const { phase } = status;
  const shimmer = (variantProps.$animate ?? "shimmer") === "shimmer";
  // The placeholders that remain during a reveal keep their shimmer. A pulse
  // fades the whole area, content included, so it stops when the reveal starts.
  const animated = phase === "skeleton" || (phase === "reveal" && shimmer);

  // Measures the reveal rows while all parts still show placeholders, before
  // the browser paints.
  useSafeLayoutEffect(() => {
    if (status.phase !== "reveal") return;
    if (status.step !== -1) return;
    const root = rootRef.current;
    if (!root || prefersReducedMotion(root)) {
      setStatus({ phase: "content", step: -1, rows: null });
      return;
    }
    const rows = getRevealRows(parts, getWindow(root).innerHeight);
    setStatus((status) => ({ ...status, step: 0, rows }));
  }, [status, parts]);

  // Shows the next row, or ends the reveal after the last row fades in.
  React.useEffect(() => {
    if (status.phase !== "reveal") return;
    if (status.step === -1) return;
    const lastRow = Math.max(0, ...(status.rows?.values() ?? []));
    const done = status.step >= lastRow;
    const timeout = setTimeout(
      () => {
        setStatus((status) => {
          if (done) {
            return { phase: "content", step: -1, rows: null };
          }
          return { ...status, step: status.step + 1 };
        });
      },
      done ? REVEAL_DURATION : REVEAL_STEP,
    );
    return () => clearTimeout(timeout);
  }, [status]);

  const partContext = React.useMemo(() => ({ status, parts }), [status, parts]);

  return (
    <SkeletonContext.Provider value={phase === "reveal" ? "content" : phase}>
      <SkeletonPartContext.Provider value={partContext}>
        <ak.Role.div
          {...skeleton.jsx({
            ...variantProps,
            ...(!animated && { $animate: false }),
          })}
          {...rest}
          ref={mergedRef}
        />
      </SkeletonPartContext.Provider>
    </SkeletonContext.Provider>
  );
}

interface SkeletonPart {
  // Whether the part renders its children instead of the placeholder.
  content: boolean;
  // Whether the children replace the placeholder and fade in.
  reveal: boolean;
  pending: boolean;
  ref: (element: HTMLElement | null) => void;
}

function useSkeletonPart(): SkeletonPart {
  const context = React.useContext(SkeletonPartContext);
  const id = React.useId();
  const parts = context?.parts;
  const ref = React.useCallback(
    (element: HTMLElement | null) => {
      if (!parts) return;
      if (element) {
        parts.set(id, element);
      } else {
        parts.delete(id);
      }
    },
    [parts, id],
  );
  // A part without a root is a static placeholder, such as in a thumbnail.
  if (!context) {
    return { content: false, reveal: false, pending: false, ref };
  }
  const { phase, step, rows } = context.status;
  if (phase === "reveal") {
    const row = rows?.get(id) ?? 0;
    const content = step !== -1 && row <= step;
    const reveal = content && row !== OFFSCREEN_ROW;
    return { content, reveal, pending: false, ref };
  }
  return {
    content: phase === "content",
    reveal: false,
    pending: phase === "pending",
    ref,
  };
}

// Whether every child is text, which can move into a wrapper and out of it
// without losing anything.
function isText(children: React.ReactNode) {
  return React.Children.toArray(children).every(
    (child) => typeof child === "string" || typeof child === "number",
  );
}

// Fades in children that replace a placeholder. An element child takes the
// animation through its class name, so it keeps its place in the tree after the
// reveal. With `wrap`, text children fade in a wrapper. Other children show
// without a fade, because a wrapper would mount them again when the reveal
// ends. The result is memoized, because every row of a reveal renders all parts
// again, and a new element would render the whole child tree again.
function useRevealContent(
  reveal: boolean,
  children: React.ReactNode,
  wrap = false,
) {
  return React.useMemo(() => {
    if (!reveal) {
      return children;
    }
    if (children == null) {
      return children;
    }
    if (typeof children === "boolean") {
      return children;
    }
    const { className } = skeletonReveal.jsx();
    if (
      React.isValidElement<{ className?: unknown }>(children) &&
      children.type !== React.Fragment
    ) {
      const childClassName = children.props.className;
      // A class name that is not a string, such as a function, can't take the
      // animation class.
      if (childClassName != null && typeof childClassName !== "string") {
        return children;
      }
      return React.cloneElement(children, {
        className: cx(childClassName, className),
      });
    }
    if (!wrap) {
      return children;
    }
    if (!isText(children)) {
      return children;
    }
    return <span className={className}>{children}</span>;
  }, [reveal, children, wrap]);
}

export interface SkeletonBoxProps
  extends ak.RoleProps<"div">, VariantProps<typeof skeletonBox> {}

/**
 * Renders a rectangular placeholder, or its children when the content loads.
 * Outside a `Skeleton`, it renders a static placeholder. Give the children the
 * same size, because the part renders only its children after loading.
 * @example
 * <SkeletonBox className="aspect-video w-full">
 *   <img src={post?.image} alt="" className="aspect-video w-full" />
 * </SkeletonBox>
 */
export function SkeletonBox({ children, ref, ...props }: SkeletonBoxProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonBox);
  const mergedRef = useMergeRefs(ref, part.ref);
  const content = useRevealContent(part.reveal, children);
  if (part.content) {
    return <>{content}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      data-pending={part.pending || undefined}
      {...skeletonBox.jsx(variantProps)}
      {...rest}
      ref={mergedRef}
    />
  );
}

export interface SkeletonCircleProps
  extends ak.RoleProps<"div">, VariantProps<typeof skeletonCircle> {}

/**
 * Renders a round placeholder, or its children when the content loads. Outside
 * a `Skeleton`, it renders a static placeholder.
 * @example
 * <SkeletonCircle className="size-10">
 *   <img src={user?.avatar} alt="" className="size-10 rounded-full" />
 * </SkeletonCircle>
 */
export function SkeletonCircle({
  children,
  ref,
  ...props
}: SkeletonCircleProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonCircle);
  const mergedRef = useMergeRefs(ref, part.ref);
  const content = useRevealContent(part.reveal, children);
  if (part.content) {
    return <>{content}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      data-pending={part.pending || undefined}
      {...skeletonCircle.jsx(variantProps)}
      {...rest}
      ref={mergedRef}
    />
  );
}

export interface SkeletonLineProps
  extends ak.RoleProps<"span">, VariantProps<typeof skeletonLine> {}

/**
 * Renders a placeholder for one line of text, or its children when the content
 * loads. It follows the font size and line height, so put it where the text
 * goes. Outside a `Skeleton`, it renders a static placeholder.
 * @example
 * <Heading>
 *   <SkeletonLine className="w-48">{post?.title}</SkeletonLine>
 * </Heading>
 */
export function SkeletonLine({ children, ref, ...props }: SkeletonLineProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonLine);
  const mergedRef = useMergeRefs(ref, part.ref);
  const content = useRevealContent(part.reveal, children, true);
  if (part.content) {
    return <>{content}</>;
  }
  return (
    <ak.Role.span
      aria-hidden
      data-pending={part.pending || undefined}
      {...skeletonLine.jsx(variantProps)}
      {...rest}
      ref={mergedRef}
    />
  );
}

// React 19 renders a boolean inert attribute and drops an empty one, while
// React 18 does the opposite. The attribute must be in the server HTML, so the
// child cannot take focus before hydration. The types follow React 19.
const inertProps = (
  Number.parseInt(React.version, 10) >= 19 ? { inert: true } : { inert: "" }
) as { inert?: boolean };

export interface SkeletonFillProps
  extends ak.RoleProps<"span">, VariantProps<typeof skeletonFill> {}

/**
 * Paints its only child as the placeholder, so the child keeps its own size and
 * corners. The child cannot receive focus or input until the content loads. Use
 * it for controls such as buttons, badges, and inputs. The child must generate
 * its own box, so use `SkeletonLine` for inline text, such as a link or a key.
 * Inputs, selects, and textareas show the tint without the shimmer highlight.
 * @example
 * <SkeletonFill>
 *   <Button>Follow</Button>
 * </SkeletonFill>
 */
export function SkeletonFill({ children, ref, ...props }: SkeletonFillProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonFill);
  const mergedRef = useMergeRefs(ref, part.ref);
  const content = useRevealContent(part.reveal, children);
  if (part.content) {
    return <>{content}</>;
  }
  return (
    <ak.Role.span
      {...inertProps}
      aria-hidden
      data-pending={part.pending || undefined}
      {...skeletonFill.jsx(variantProps)}
      {...rest}
      ref={mergedRef}
    >
      {children}
    </ak.Role.span>
  );
}
