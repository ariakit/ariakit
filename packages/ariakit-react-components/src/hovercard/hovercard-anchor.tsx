import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import { useHovercardProviderContext } from "./hovercard-context.tsx";
import type { HovercardStore } from "./hovercard-store.ts";
import type { HovercardTriggerOptions } from "./hovercard-trigger.tsx";
import { useHovercardTrigger } from "./hovercard-trigger.tsx";

const TagName = "a" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `HovercardAnchor` component.
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardAnchor({ store });
 * <Role {...props} render={<a />}>@username</Role>
 * <Hovercard store={store}>Details</Hovercard>
 * ```
 */
export const useHovercardAnchor = createHook<TagName, HovercardAnchorOptions>(
  function useHovercardAnchor({ store, showOnHover = true, ...props }) {
    const context = useHovercardProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "HovercardAnchor must receive a `store` prop or be wrapped in a HovercardProvider component.",
    );
    return useHovercardTrigger<TagName>({
      store,
      showOnHover,
      unstable__positioningAnchor: true,
      ...props,
    });
  },
);

/**
 * Renders an anchor element that will open a
 * [`Hovercard`](https://ariakit.com/reference/hovercard) popup on hover.
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx {2}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>Details</Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardAnchor = forwardRef(function HovercardAnchor(
  props: HovercardAnchorProps,
) {
  const htmlProps = useHovercardAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface HovercardAnchorOptions<
  T extends ElementType = TagName,
> extends Omit<
  HovercardTriggerOptions<T>,
  "store" | "unstable__positioningAnchor"
> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.com/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`HovercardProvider`](https://ariakit.com/reference/hovercard-provider)
   * component's context will be used.
   */
  store?: HovercardStore;
}

export type HovercardAnchorProps<T extends ElementType = TagName> = Props<
  T,
  HovercardAnchorOptions<T>
>;
