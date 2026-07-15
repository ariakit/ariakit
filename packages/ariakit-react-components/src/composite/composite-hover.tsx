import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  contains,
  hasFocus,
  hasFocusWithin,
  hasOwnProperty,
  invariant,
  isElement,
  removeUndefinedValues,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, MouseEvent as ReactMouseEvent } from "react";
import { useCallback } from "react";
import { useCompositeScopedContext } from "./composite-context.tsx";
import type { CompositeStore } from "./composite-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function hoveringInside(event: ReactMouseEvent<HTMLElement>) {
  const nextElement = event.relatedTarget;
  if (!isElement(nextElement)) return false;
  return contains(event.currentTarget, nextElement);
}

const symbol = Symbol("composite-hover");
type ElementWithSymbol = HTMLElement & { [symbol]?: boolean };

function movingToAnotherItem(event: ReactMouseEvent<HTMLElement>) {
  const { relatedTarget } = event;
  if (!isElement(relatedTarget)) return false;
  let dest: Element | null = relatedTarget;
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
 * @see https://ariakit.com/components/composite
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
    const context = useCompositeScopedContext();
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
 * [`CompositeItem`](https://ariakit.com/reference/composite-item) component.
 * The
 * [`focusOnHover`](https://ariakit.com/reference/composite-hover#focusonhover)
 * and
 * [`blurOnHoverEnd`](https://ariakit.com/reference/composite-hover#bluronhoverend)
 * props can be used to customize the behavior.
 * @see https://ariakit.com/components/composite
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

export interface CompositeHoverOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.com/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.com/reference/composite) or
   * [`CompositeProvider`](https://ariakit.com/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
  /**
   * Determines if the composite item should be _focused_ when hovered over.
   *
   * Note that the actual DOM focus will stay on the composite element. This
   * item will get the
   * [`data-active-item`](https://ariakit.com/guide/styling#data-active-item)
   * attribute so it can be styled as if it's focused.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.com/examples/combobox-multiple)
   * - [Combobox with integrated
   *   filter](https://ariakit.com/examples/combobox-filtering-integrated)
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Submenu with
   *   Combobox](https://ariakit.com/examples/menu-nested-combobox)
   * - [Combobox with Tabs](https://ariakit.com/examples/combobox-tabs)
   * @default true
   */
  focusOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
  /**
   * Determines if the composite item should lose focus when the mouse leaves.
   * By default, this is set to `true` if
   * [`focusOnHover`](https://ariakit.com/reference/composite-hover#focusonhover)
   * is `true`.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Combobox with integrated
   *   filter](https://ariakit.com/examples/combobox-filtering-integrated)
   * - [Submenu with
   *   Combobox](https://ariakit.com/examples/menu-nested-combobox)
   * - [Combobox with Tabs](https://ariakit.com/examples/combobox-tabs)
   * - [Command Menu with
   *   Tabs](https://ariakit.com/examples/dialog-combobox-tab-command-menu)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.com/examples/select-combobox-tab)
   */
  blurOnHoverEnd?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
}

export type CompositeHoverProps<T extends ElementType = TagName> = Props<
  T,
  CompositeHoverOptions<T>
>;
