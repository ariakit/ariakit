import { MouseEvent, useCallback, useRef, useState } from "react";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button/button";
import { DisclosureState } from "./disclosure-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that controls the visibility of a
 * disclosure content element.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const state = useDisclosureState();
 * const props = useDisclosure({ state });
 * <Role {...props}>Disclosure</Role>
 * <DisclosureContent state={state}>Content</DisclosureContent>
 * ```
 */
export const useDisclosure = createHook<DisclosureOptions>(
  ({ state, toggleOnClick = true, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [expanded, setExpanded] = useState(false);

    // Assigns the disclosureRef whenever it's undefined or disconnected from
    // the DOM. If this disclosure element is the disclosureRef, this element
    // will get the `aria-expanded` attribute set to `true` when the disclosure
    // content is visible.
    useSafeLayoutEffect(() => {
      const currentDisclosure = state.disclosureRef.current;
      if (!currentDisclosure || !currentDisclosure.isConnected) {
        state.disclosureRef.current = ref.current;
      }
      const isCurrentDisclosure = state.disclosureRef.current === ref.current;
      setExpanded(state.visible && isCurrentDisclosure);
    }, [state.disclosureRef, state.visible]);

    const onMouseDownProp = useEventCallback(props.onMouseDown);

    const onMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        state.disclosureRef.current = event.currentTarget;
        onMouseDownProp(event);
      },
      [onMouseDownProp, state.disclosureRef]
    );

    const onClickProp = useEventCallback(props.onClick);
    const toggleOnClickProp = useBooleanEventCallback(toggleOnClick);
    const isDuplicate = "data-disclosure" in props;

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        state.disclosureRef.current = event.currentTarget;
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (isDuplicate) return;
        if (!toggleOnClickProp(event)) return;
        state.toggle();
      },
      [
        state.disclosureRef,
        onClickProp,
        isDuplicate,
        toggleOnClickProp,
        state.toggle,
      ]
    );

    props = {
      "data-disclosure": "",
      "aria-expanded": expanded,
      "aria-controls": state.contentElement?.id,
      ...props,
      ref: useForkRef(ref, props.ref),
      onMouseDown,
      onClick,
    };

    props = useButton(props);

    return props;
  }
);

/**
 * A component that renders an element that controls the visibility of a
 * disclosure content element.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureState();
 * <Disclosure state={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent state={disclosure}>Content</DisclosureContent>
 * ```
 */
export const Disclosure = createComponent<DisclosureOptions>((props) => {
  const htmlProps = useDisclosure(props);
  return createElement("button", htmlProps);
});

export type DisclosureOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useDisclosureState` hook.
   */
  state: DisclosureState;
  /**
   * Determines whether `state.toggle()` will be called on click. This is useful
   * if you want to handle the toggle logic yourself.
   * @default true
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
};

export type DisclosureProps<T extends As = "button"> = Props<
  DisclosureOptions<T>
>;
