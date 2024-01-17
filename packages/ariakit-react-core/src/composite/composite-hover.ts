import { useCallback } from "react";
import type { ElementType, MouseEvent as ReactMouseEvent } from "react";
import { contains } from "@ariakit/core/utils/dom";
import { hasFocus, hasFocusWithin } from "@ariakit/core/utils/focus";
import {
  hasOwnProperty,
  invariant,
  removeUndefinedValues,
} from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
} from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import { useCompositeContext } from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getMouseDestination(event: ReactMouseEvent<HTMLElement>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return relatedTarget as Element;
  }
  return null;
}

function hoveringInside(event: ReactMouseEvent<HTMLElement>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

const symbol = Symbol("composite-hover");
type ElementWithSymbol = HTMLElement & { [symbol]?: boolean };

function movingToAnotherItem(event: ReactMouseEvent<HTMLElement>) {
  let dest = getMouseDestination(event);
  if (!dest) return false;
  do {
    if (hasOwnProperty(dest, symbol) && dest[symbol]) return true;
    dest = dest.parentElement;
  } while (dest);
  return false;
}

/**
 * Returns props to create a `CompositeHover` component. The composite item that
 * receives these props will get focused on mouse move and lose focus to the
 * composite base element on mouse leave. This should be combined with the
 * `CompositeItem` component, the `useCompositeItem` hook or any component/hook
 * that uses them underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeHover({ store });
 * <CompositeItem store={store} {...props}>Item</CompositeItem>
 * ```
 */
export const useCompositeHover = createHook<TagName, CompositeHoverOptions>(
  function useCompositeHover({
    store,
    focusOnHover = true,
    blurOnHoverEnd = !!focusOnHover,
    ...props
  }) {
    const context = useCompositeContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeHover must be wrapped in a Composite component.",
    );

    const isMouseMoving = useIsMouseMoving();

    const onMouseMoveProp = props.onMouseMove;
    const focusOnHoverProp = useBooleanEvent(focusOnHover);

    const onMouseMove = useEvent((event: ReactMouseEvent<HTMLType>) => {
      onMouseMoveProp?.(event);
      if (event.defaultPrevented) return;
      if (!isMouseMoving()) return;
      if (!focusOnHoverProp(event)) return;
      // If we're hovering over an item that doesn't have DOM focus, we move
      // focus to the composite element. We're doing this here before setting
      // the active id because the composite element will automatically set the
      // active id to null when it receives focus.
      if (!hasFocusWithin(event.currentTarget)) {
        const baseElement = store?.getState().baseElement;
        if (baseElement && !hasFocus(baseElement)) {
          baseElement.focus();
        }
      }
      store?.setActiveId(event.currentTarget.id);
    });

    const onMouseLeaveProp = props.onMouseLeave;
    const blurOnHoverEndProp = useBooleanEvent(blurOnHoverEnd);

    const onMouseLeave = useEvent((event: ReactMouseEvent<HTMLType>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented) return;
      if (!isMouseMoving()) return;
      if (hoveringInside(event)) return;
      if (movingToAnotherItem(event)) return;
      if (!focusOnHoverProp(event)) return;
      if (!blurOnHoverEndProp(event)) return;
      store?.setActiveId(null);
      // Move focus to the composite element.
      store?.getState().baseElement?.focus();
    });

    const ref = useCallback((element: ElementWithSymbol | null) => {
      if (!element) return;
      element[symbol] = true;
    }, []);

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
      onMouseLeave,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders an element in a composite widget that receives focus on mouse move
 * and loses focus to the composite base element on mouse leave.
 *
 * This should be combined with the
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) component.
 * The
 * [`focusOnHover`](https://ariakit.org/reference/composite-hover#focusonhover)
 * and
 * [`blurOnHoverEnd`](https://ariakit.org/reference/composite-hover#bluronhoverend)
 * props can be used to customize the behavior.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3-5}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeHover render={<CompositeItem />}>
 *       Item
 *     </CompositeHover>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeHover = memo(
  forwardRef(function CompositeHover(props: CompositeHoverProps) {
    const htmlProps = useCompositeHover(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface CompositeHoverOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
  /**
   * Determines if the composite item should be _focused_ when hovered over.
   *
   * Note that the actual DOM focus will stay on the composite element. This
   * item will get the
   * [`data-active-item`](https://ariakit.org/guide/styling#data-active-item)
   * attribute so it can be styled as if it's focused.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * @default true
   */
  focusOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
  /**
   * Determines if the composite item should lose focus when the mouse leaves.
   * By default, this is set to `true` if
   * [`focusOnHover`](https://ariakit.org/reference/composite-hover#focusonhover)
   * is `true`.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  blurOnHoverEnd?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
}

export type CompositeHoverProps<T extends ElementType = TagName> = Props<
  T,
  CompositeHoverOptions<T>
>;
