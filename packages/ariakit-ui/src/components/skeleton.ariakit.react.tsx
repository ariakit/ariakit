import * as ak from "@ariakit/react";
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
 * - `skeleton`: the placeholders are shown.
 * - `content`: parts render their children.
 */
export type SkeletonState = "pending" | "skeleton" | "content";

const SkeletonContext = React.createContext<SkeletonState | null>(null);

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

// A part without a root is a static placeholder, such as in a thumbnail.
function useSkeletonPartState() {
  return React.useContext(SkeletonContext) ?? "skeleton";
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
  return (
    <SkeletonContext.Provider value={state}>
      <ak.Role.div
        {...skeleton.jsx({
          ...variantProps,
          ...(state !== "skeleton" && { $animate: false }),
        })}
        {...rest}
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
  const state = useSkeletonPartState();
  const [variantProps, rest] = splitProps(props, skeletonBox);
  if (state === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      data-pending={state === "pending" || undefined}
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
  const state = useSkeletonPartState();
  const [variantProps, rest] = splitProps(props, skeletonCircle);
  if (state === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.div
      aria-hidden
      data-pending={state === "pending" || undefined}
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
  const state = useSkeletonPartState();
  const [variantProps, rest] = splitProps(props, skeletonLine);
  if (state === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.span
      aria-hidden
      data-pending={state === "pending" || undefined}
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
  const state = useSkeletonPartState();
  const [variantProps, rest] = splitProps(props, skeletonFill);
  if (state === "content") {
    return <>{children}</>;
  }
  return (
    <ak.Role.span
      {...inertProps}
      aria-hidden
      data-pending={state === "pending" || undefined}
      {...skeletonFill.jsx(variantProps)}
      {...rest}
    >
      {children}
    </ak.Role.span>
  );
}
