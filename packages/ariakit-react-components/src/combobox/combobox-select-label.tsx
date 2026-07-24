import {
  useEvent,
  useId,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { invariant, removeUndefinedValues } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxSelectLabel` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxSelectLabel = createHook<
  TagName,
  ComboboxSelectLabelOptions
>(function useComboboxSelectLabel({ store, ...props }) {
  const context = useComboboxProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxSelectLabel must receive a `store` prop or be wrapped in a ComboboxProvider component.",
  );

  const id = useId(props.id);
  const onClickProp = props.onClick;

  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    queueMicrotask(() => {
      store?.getState().selectElement?.focus();
    });
  });

  props = {
    ...props,
    id,
    ref: useMergeRefs(store.setSelectLabelElement, props.ref),
    onClick,
    style: {
      cursor: "default",
      ...props.style,
    },
  };

  return removeUndefinedValues(props);
});

/**
 * Renders a label for the
 * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select)
 * component. Clicking the label moves focus to the select element.
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxSelectLabel = memo(
  forwardRef(function ComboboxSelectLabel(props: ComboboxSelectLabelProps) {
    const htmlProps = useComboboxSelectLabel(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ComboboxSelectLabelOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook.
   */
  store?: ComboboxStore;
}

export type ComboboxSelectLabelProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectLabelOptions<T>
>;
