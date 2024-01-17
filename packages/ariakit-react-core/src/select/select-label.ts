import type { ElementType, MouseEvent } from "react";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useEvent, useId, useMergeRefs } from "../utils/hooks.js";
import {
  createElement,
  createHook2,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";
import { useSelectProviderContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `SelectLabel` component. Since it's not a native
 * select element, we can't use the native label element. The `SelectLabel`
 * component will move focus and click on the `Select` component when the user
 * clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Select store={store} />
 * ```
 */
export const useSelectLabel = createHook2<TagName, SelectLabelOptions>(
  function useSelectLabel({ store, ...props }) {
    const context = useSelectProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectLabel must receive a `store` prop or be wrapped in a SelectProvider component.",
    );

    const id = useId(props.id);

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      // queueMicrotask will guarantee that the focus and click events will be
      // triggered only after the current event queue is flushed (which includes
      // this click event).
      queueMicrotask(() => {
        const select = store?.getState().selectElement;
        select?.focus();
        select?.click();
      });
    });

    props = {
      id,
      ...props,
      ref: useMergeRefs(store.setLabelElement, props.ref),
      onClick,
      style: {
        cursor: "default",
        ...props.style,
      },
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a label for the [`Select`](https://ariakit.org/reference/select)
 * component. Since it's not a native select element, we can't use the native
 * label element. This component will move focus and click on the
 * [`Select`](https://ariakit.org/reference/select) component when clicked.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {2}
 * <SelectProvider defaultValue="Apple">
 *   <SelectLabel>Favorite fruit</SelectLabel>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectLabel = memo(
  forwardRef(function SelectLabel(props: SelectLabelProps) {
    const htmlProps = useSelectLabel(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface SelectLabelOptions<_T extends ElementType = TagName>
  extends Options2 {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the closest
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component's context will be used.
   */
  store?: SelectStore;
}

export type SelectLabelProps<T extends ElementType = TagName> = Props2<
  T,
  SelectLabelOptions<T>
>;
