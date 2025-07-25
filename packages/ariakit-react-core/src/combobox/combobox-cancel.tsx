import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType, MouseEvent } from "react";
import { Fragment } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import { useEvent, useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const children = (
  <svg
    aria-hidden="true"
    display="block"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    width="1em"
    height="1em"
    pointerEvents="none"
  >
    <line x1="5" y1="5" x2="11" y2="11" />
    <line x1="5" y1="11" x2="11" y2="5" />
  </svg>
);

/**
 * Returns props to create a `ComboboxCancel` component that clears the combobox
 * input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxCancel({ store });
 * <Combobox store={store} />
 * <Role {...props} />
 * ```
 */
export const useComboboxCancel = createHook<TagName, ComboboxCancelOptions>(
  function useComboboxCancel({ store, hideWhenEmpty, ...props }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxCancel must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.setValue("");
      // Move focus to the combobox input.
      store?.move(null);
    });

    const comboboxId = store.useState((state) => state.baseElement?.id);
    const empty = store.useState((state) => state.value === "");

    props = useWrapElement(
      props,
      (element) => {
        if (!hideWhenEmpty) return element;
        if (empty) return <Fragment />;
        return element;
      },
      [hideWhenEmpty, empty],
    );

    props = {
      children,
      "aria-label": "Clear input",
      // This aria-controls will ensure the combobox popup remains visible when
      // this element gets focused. This logic is done in the ComboboxPopover
      // component.
      "aria-controls": comboboxId,
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders a combobox cancel button that clears the combobox input value when
 * clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxCancel />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxCancel = forwardRef(function ComboboxCancel(
  props: ComboboxCancelProps,
) {
  const htmlProps = useComboboxCancel(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxCancelOptions<T extends ElementType = TagName>
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * When enabled, the button won't be rendered when the combobox input value is
   * empty.
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   * @default false
   */
  hideWhenEmpty?: boolean;
}

export type ComboboxCancelProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxCancelOptions<T>
>;
