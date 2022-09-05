import { FocusEvent, KeyboardEvent } from "react";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import {
  getDocument,
  getTextboxSelection,
  isTextField,
} from "ariakit-utils/dom";
import { selectTextField } from "./__utils";
import { CompositeState } from "./composite-state";

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
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an input as a composite item. This should be used
 * in conjunction with the `CompositeItem` component, the `useCompositeItem`
 * hook, or any other component/hook that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeInput({ state });
 * <Composite state={state}>
 *   <CompositeItem {...props} />
 * </Composite>
 * ```
 */
export const useCompositeInput = createHook<CompositeInputOptions>(
  ({ state, ...props }) => {
    const onKeyDownCaptureProp = props.onKeyDownCapture;

    const onKeyDownCapture = useEvent(
      (event: KeyboardEvent<HTMLInputElement>) => {
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
      }
    );

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      selectTextField(event.currentTarget);
    });

    props = {
      ...props,
      onKeyDownCapture,
      onFocus,
    };

    return props;
  }
);

/**
 * A component that renders an input as a composite item. This should be used in
 * conjunction with the `CompositeItem` component or a component that uses
 * `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeItem as={CompositeInput} />
 * </Composite>
 * ```
 */
export const CompositeInput = createComponent<CompositeInputOptions>(
  (props) => {
    const htmlProps = useCompositeInput(props);
    return createElement("input", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CompositeInput.displayName = "CompositeInput";
}

export type CompositeInputOptions<T extends As = "input"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
};

export type CompositeInputProps<T extends As = "input"> = Props<
  CompositeInputOptions<T>
>;
