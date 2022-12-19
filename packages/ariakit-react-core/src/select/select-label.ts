import { MouseEvent } from "react";
import { useEvent, useForkRef, useId } from "../utils/hooks";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Options, Props } from "../utils/types";
import { SelectStore } from "./select-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label for the `Select` component. Since it's
 * not a native select element, we can't use the native label element. The
 * `SelectLabel` component will move focus and click on the `Select` component
 * when the user clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Select store={store} />
 * ```
 */
export const useSelectLabel = createHook<SelectLabelOptions>(
  ({ store, ...props }) => {
    const id = useId(props.id);

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      // queueMicrotask will guarantee that the focus and click events will be
      // triggered only after the current event queue is flushed (which includes
      // this click event).
      queueMicrotask(() => {
        const select = store.getState().selectElement;
        select?.focus();
        select?.click();
      });
    });

    props = {
      id,
      ...props,
      ref: useForkRef(store.setLabelElement, props.ref),
      onClick,
      style: {
        cursor: "default",
        ...props.style,
      },
    };

    return props;
  }
);

/**
 * A component that renders a label for the `Select` component. Since it's not a
 * native select element, we can't use the native label element. The
 * `SelectLabel` component will move focus and click on the `Select` component
 * when the user clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore({ defaultValue: "Apple" });
 * <SelectLabel store={select}>Favorite fruit</SelectLabel>
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectLabel = createMemoComponent<SelectLabelOptions>((props) => {
  const htmlProps = useSelectLabel(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectLabel.displayName = "SelectLabel";
}

export type SelectLabelOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useSelectStore` hook. If not provided, the parent
   * `Select` component's context will be used.
   */
  store: SelectStore;
};

export type SelectLabelProps<T extends As = "div"> = Props<
  SelectLabelOptions<T>
>;
