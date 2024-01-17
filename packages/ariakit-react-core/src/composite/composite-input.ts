import type { ElementType, FocusEvent, KeyboardEvent } from "react";
import {
  getDocument,
  getTextboxSelection,
  isTextField,
} from "@ariakit/core/utils/dom";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useEvent } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import type { CompositeStore } from "./composite-store.js";
import { selectTextField } from "./utils.js";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getValueLength(element: HTMLElement) {
  if (isTextField(element)) {
    return element.value.length;
  } else if (element.isContentEditable) {
    const range = getDocument(element).createRange();
    range.selectNodeContents(element);
    return range.toString().length;
  }
  return 0;
}

/**
 * Returns props to create a `CompositeInput` component. This should be used in
 * conjunction with the `CompositeItem` component, the `useCompositeItem` hook,
 * or any other component/hook that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeInput({ store });
 * <Composite store={store}>
 *   <CompositeItem {...props} />
 * </Composite>
 * ```
 */
export const useCompositeInput = createHook<TagName, CompositeInputOptions>(
  function useCompositeInput({ store, ...props }) {
    const onKeyDownCaptureProp = props.onKeyDownCapture;

    const onKeyDownCapture = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownCaptureProp?.(event);
      if (event.defaultPrevented) return;
      const element = event.currentTarget;
      if (!element.isContentEditable && !isTextField(element)) return;
      const selection = getTextboxSelection(element);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        if (selection.end !== getValueLength(element)) {
          event.stopPropagation();
        }
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        if (selection.start !== 0) {
          event.stopPropagation();
        }
      }
    });

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      selectTextField(event.currentTarget);
    });

    props = {
      ...props,
      onKeyDownCapture,
      onFocus,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders an input as a composite item. This should be used in conjunction with
 * the [`CompositeItem`](https://ariakit.org/reference/composite-item) component
 * or a component that uses
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem render={<CompositeInput />} />
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeInput = memo(
  forwardRef(function CompositeInput(props: CompositeInputProps) {
    const htmlProps = useCompositeInput(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface CompositeInputOptions<_T extends ElementType = TagName>
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
}

export type CompositeInputProps<T extends ElementType = TagName> = Props<
  T,
  CompositeInputOptions<T>
>;
