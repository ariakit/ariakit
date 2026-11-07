import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { usePerceptibleValue } from "../react-utils/use-perceptible-value.react.ts";
import {
  skeleton,
  skeletonBox,
  skeletonCircle,
  skeletonFill,
  skeletonLine,
} from "../styles/skeleton.ts";

/**
 * The state of a skeleton area:
 * - `pending`: loading, but the placeholders are not shown yet. Parts keep
 *   their space without painting.
 * - `skeleton`: the placeholders are shown. After loading ends, they stay in
 *   this state while they fade out.
 * - `content`: parts render their children.
 */
export type SkeletonState = "pending" | "skeleton" | "content";

// Parts also need to know when the placeholders fade out, which the public
// state reports as `skeleton`.
type SkeletonPhase = SkeletonState | "leave";

interface SkeletonContextValue {
  phase: SkeletonPhase;
  // Whether the root has shown its content, so new placeholders replace it.
  reload: boolean;
}

const SkeletonContext = React.createContext<SkeletonContextValue | null>(null);

/**
 * Returns the state of the closest `Skeleton`, or `content` outside of one. Use
 * it for content that is not inside a skeleton part.
 * @example
 * function SaveButton() {
 *   const state = useSkeletonState();
 *   return <Button disabled={state !== "content"}>Save</Button>;
 * }
 */
export function useSkeletonState(): SkeletonState {
  const context = React.useContext(SkeletonContext);
  if (!context) return "content";
  if (context.phase === "leave") return "skeleton";
  return context.phase;
}

// A part without a root is a static placeholder, such as in a thumbnail.
const staticPart: SkeletonContextValue = { phase: "skeleton", reload: false };

function useSkeletonPart() {
  return React.useContext(SkeletonContext) ?? staticPart;
}

// The markers that the part styles read. Pending and leaving parts keep their
// space without painting, and parts that replace loaded content fade in.
function getPartProps({ phase, reload }: SkeletonContextValue) {
  return {
    "data-pending": phase === "pending" || undefined,
    "data-leave": phase === "leave" || undefined,
    "data-reload": reload || undefined,
  };
}

// Returns the opacity transitions that fade out the placeholders in `element`.
function getLeaveTransitions(element: Element | null) {
  if (!element) return [];
  const { CSSTransition, KeyframeEffect } = getWindow(element);
  // DOM shims without Web Animations have no transitions to wait for.
  if (!CSSTransition || !KeyframeEffect) return [];
  // Reading the animations updates the styles first, so the transitions that
  // the leave marker starts are already in the list.
  return element.getAnimations({ subtree: true }).filter((animation) => {
    if (!(animation instanceof CSSTransition)) return false;
    if (animation.transitionProperty !== "opacity") return false;
    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect)) return false;
    // Other elements, such as a closing popover, can also have the marker.
    const part = effect.target?.closest("[data-leave]");
    return !!part && element.contains(part);
  });
}

export interface SkeletonProps
  extends ak.RoleProps<"div">, VariantProps<typeof skeleton> {
  /**
   * Whether the content is loading. The placeholders stay for at least 200
   * milliseconds, so fast loads do not flash. When loading ends, they fade out
   * before the parts render their children.
   * @default true
   */
  loading?: boolean;
  /**
   * Milliseconds to wait after loading starts before the placeholders fade in.
   * Loading that ends within this time never shows them. With `0`, the
   * placeholders render with the first render, including the server HTML, and
   * fade in when they replace loaded content.
   * @default 0
   */
  delay?: number;
}

/**
 * Renders a loading area for skeleton parts. The parts show placeholders while
 * `loading` is `true`, and their children when it is `false`. Add `aria-busy`
 * and a status message to the region that loads. The animation also reaches the
 * parts of nested roots, so nested roots should use the same `$animate`.
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
  const elementRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(elementRef, ref);
  const shown = usePerceptibleValue(loading, {
    delay: loading ? delay : 0,
    // Only the placeholders stay for a minimum. Content that stays would show
    // blank pending parts when the next load starts right after it.
    minDuration: loading ? 200 : 0,
    // A delay starts from the pending state, so a fast load on mount never
    // shows the placeholders.
    initialValue: delay > 0 ? false : loading,
  });
  const [leaving, setLeaving] = React.useState(false);
  const [previousShown, setPreviousShown] = React.useState(shown);
  if (shown !== previousShown) {
    setPreviousShown(shown);
    // When the placeholders hide, they fade out before the content replaces
    // them.
    setLeaving(!shown);
  }
  const phase: SkeletonPhase = shown
    ? "skeleton"
    : loading
      ? "pending"
      : leaving
        ? "leave"
        : "content";
  // Placeholders fade in only when they replace loaded content. Before that,
  // they paint with the first render, including the server HTML.
  const [reload, setReload] = React.useState(false);
  if (phase === "content" && !reload) {
    setReload(true);
  }
  const context = React.useMemo(() => ({ phase, reload }), [phase, reload]);

  // A layout effect, so the content replaces the placeholders before the next
  // paint when no fade runs, such as with reduced motion.
  useSafeLayoutEffect(() => {
    if (phase !== "leave") return;
    // The styles own the fade, so the content waits for the transitions that
    // run instead of a fixed duration.
    const transitions = getLeaveTransitions(elementRef.current);
    if (!transitions.length) {
      setLeaving(false);
      return;
    }
    let active = true;
    void Promise.allSettled(transitions.map(({ finished }) => finished)).then(
      () => {
        if (!active) return;
        setLeaving(false);
      },
    );
    return () => {
      active = false;
    };
  }, [phase]);

  const animated = phase === "skeleton" || phase === "leave";
  return (
    <SkeletonContext.Provider value={context}>
      <ak.Role.div
        {...skeleton.jsx({
          ...variantProps,
          ...(!animated && { $animate: false }),
        })}
        {...rest}
        ref={mergedRef}
      />
    </SkeletonContext.Provider>
  );
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
export function SkeletonBox({ children, ...props }: SkeletonBoxProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonBox);
  if (part.phase === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      {...getPartProps(part)}
      {...skeletonBox.jsx(variantProps)}
      {...rest}
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
export function SkeletonCircle({ children, ...props }: SkeletonCircleProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonCircle);
  if (part.phase === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      {...getPartProps(part)}
      {...skeletonCircle.jsx(variantProps)}
      {...rest}
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
export function SkeletonLine({ children, ...props }: SkeletonLineProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonLine);
  if (part.phase === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.span
      aria-hidden
      {...getPartProps(part)}
      {...skeletonLine.jsx(variantProps)}
      {...rest}
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
export function SkeletonFill({ children, ...props }: SkeletonFillProps) {
  const part = useSkeletonPart();
  const [variantProps, rest] = splitProps(props, skeletonFill);
  if (part.phase === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.span
      {...inertProps}
      aria-hidden
      {...getPartProps(part)}
      {...skeletonFill.jsx(variantProps)}
      {...rest}
    >
      {children}
    </ak.Role.span>
  );
}
