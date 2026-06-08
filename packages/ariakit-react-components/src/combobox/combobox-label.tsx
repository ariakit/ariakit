import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { invariant, removeUndefinedValues } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { useRef } from "react";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import {
  removeComboboxSelectLabelElement,
  setComboboxSelectLabelElement,
  useComboboxSelectElement,
} from "./combobox-select-state.ts";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxLabel` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Combobox store={store} />
 * ```
 */
export const useComboboxLabel = createHook<TagName, ComboboxLabelOptions>(
  function useComboboxLabel({ store, ...props }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxLabel must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const id = useId(props.id);
    const ref = useRef<HTMLType>(null);
    const comboboxId = useStoreState(store, (state) => state.baseElement?.id);
    const selectElement = useComboboxSelectElement(store);
    const onClickProp = props.onClick;

    useSafeLayoutEffect(() => {
      if (!selectElement) return;
      const element = ref.current;
      if (!element) return;
      setComboboxSelectLabelElement(store, element);
      return () => removeComboboxSelectLabelElement(store, element);
    }, [selectElement, store]);

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!selectElement) return;
      event.preventDefault();
      selectElement.focus();
    });

    props = {
      htmlFor: selectElement ? undefined : comboboxId,
      ...props,
      id,
      ref: useMergeRefs(ref, props.ref),
      onClick,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a label for the [`Combobox`](https://ariakit.com/reference/combobox)
 * component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxLabel>Favorite fruit</ComboboxLabel>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxLabel = memo(
  forwardRef(function ComboboxLabel(props: ComboboxLabelProps) {
    const htmlProps = useComboboxLabel(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ComboboxLabelOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxLabelProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxLabelOptions<T>
>;
