import {
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { isSelfTarget } from "@ariakit/utils";
import type { ElementType, KeyboardEvent } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";
import type { ComboboxContentOptions } from "./combobox-content.tsx";
import { useComboboxContent } from "./combobox-content.tsx";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<TagName, ComboboxListOptions>(
  function useComboboxList({ store, ...props }) {
    const context = useComboboxContext();
    store = store || context;

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      // https://github.com/ariakit/ariakit/issues/4388
      if (event.nativeEvent.isComposing) return;
      if (event.defaultPrevented) return;
      if (!store) return;
      if (!isSelfTarget(event)) return;
      const { orientation, items, rtl } = store.getState();
      const isGrid = items.some((item) => !!item.rowId);
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const keyMap = {
        ArrowUp: (isGrid || isVertical) && store.last,
        ArrowRight:
          (isGrid || isHorizontal) && (rtl ? store.last : store.first),
        ArrowDown: (isGrid || isVertical) && store.first,
        ArrowLeft: (isGrid || isHorizontal) && (rtl ? store.first : store.last),
        Home: store.first,
        End: store.last,
        PageUp: store.first,
        PageDown: store.last,
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (!action) return;
      const id = action();
      if (id === undefined) return;
      const element = store.item(id)?.element;
      if (!element) return;
      event.preventDefault();
      element.focus();
    });

    props = useComboboxContent({ store, ...props });
    props = useFocusable({ ...props, onKeyDown });
    return props;
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxList = forwardRef(function ComboboxList(
  props: ComboboxListProps,
) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxListOptions<T extends ElementType = TagName>
  extends
    FocusableOptions<T>,
    Pick<ComboboxContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
