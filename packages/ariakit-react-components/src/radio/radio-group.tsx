import {
  useEvent,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  disabledFromProps,
  invariant,
  isFocusEventOutside,
} from "@ariakit/utils";
import type { ElementType, FocusEvent } from "react";
import { useContext } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import {
  RadioGroupDisabledContext,
  RadioScopedContextProvider,
  useRadioProviderContext,
} from "./radio-context.tsx";
import type { RadioStore } from "./radio-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function isCheckedRadio(element?: HTMLElement | null) {
  if (!element) return false;
  if (element.tagName === "INPUT") {
    const { type, checked } = element as HTMLInputElement;
    if (type === "radio") return checked;
  }
  if (element.getAttribute("role") !== "radio") return false;
  return element.getAttribute("aria-checked") === "true";
}

function getCheckedRadioId(store: RadioStore) {
  const { renderedItems } = store.getState();
  const checkedItem = renderedItems.find((item) =>
    isCheckedRadio(item.element),
  );
  return checkedItem?.id;
}

/**
 * Returns props to create a `RadioGroup` component.
 * @see https://ariakit.com/components/radio
 * @example
 * ```jsx
 * const store = useRadioStore();
 * const props = useRadioGroup({ store });
 * <Role {...props}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </Role>
 * ```
 */
export const useRadioGroup = createHook<TagName, RadioGroupOptions>(
  function useRadioGroup({ store, ...props }) {
    const context = useRadioProviderContext();
    store = store || context;
    const parentDisabled = useContext(RadioGroupDisabledContext);
    const disabled = parentDisabled || disabledFromProps(props);

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "RadioGroup must receive a `store` prop or be wrapped in a RadioProvider component.",
    );

    props = useWrapElement(
      props,
      (element) => (
        <RadioScopedContextProvider value={store}>
          <RadioGroupDisabledContext.Provider value={disabled}>
            {element}
          </RadioGroupDisabledContext.Provider>
        </RadioScopedContextProvider>
      ),
      [store, disabled],
    );

    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurCaptureProp?.(event);
      if (event.defaultPrevented) return;
      if (!isFocusEventOutside(event)) return;
      const checkedId = getCheckedRadioId(store);
      if (!checkedId) return;
      store.setActiveId(checkedId);
    });

    props = {
      role: "radiogroup",
      ...props,
      "aria-disabled": disabled || undefined,
      onBlurCapture,
    };

    props = useComposite({ store, ...props });

    return props;
  },
);

/**
 * Renders a [`radiogroup`](https://w3c.github.io/aria/#radiogroup) element that
 * manages a group of [`Radio`](https://ariakit.com/reference/radio) elements.
 * @see https://ariakit.com/components/radio
 * @example
 * ```jsx
 * <RadioProvider>
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export const RadioGroup = forwardRef(function RadioGroup(
  props: RadioGroupProps,
) {
  const htmlProps = useRadioGroup(props);
  return createElement(TagName, htmlProps);
});

export interface RadioGroupOptions<
  T extends ElementType = TagName,
> extends CompositeOptions<T> {
  /**
   * Determines if the radio group and its descendant
   * [`Radio`](https://ariakit.com/reference/radio) components are disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Object returned by the
   * [`useRadioStore`](https://ariakit.com/reference/use-radio-store) hook. If
   * not provided, the closest
   * [`RadioProvider`](https://ariakit.com/reference/radio-provider) component's
   * context will be used.
   */
  store?: RadioStore;
}

export type RadioGroupProps<T extends ElementType = TagName> = Props<
  T,
  RadioGroupOptions<T>
>;
