import { MouseEvent, useCallback, useRef, useState } from "react";
import {
  useEventCallback,
  useForkRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
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
    const onClickProp = useEventCallback(props.onClick);
    const isDuplicate = "data-disclosure" in props;

    useSafeLayoutEffect(() => {
      if (!state.disclosureRef.current) {
        state.disclosureRef.current = ref.current;
      }
      const isCurrentDisclosure = state.disclosureRef.current === ref.current;
      setExpanded(state.visible && isCurrentDisclosure);
    }, [state.disclosureRef, state.visible]);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        state.disclosureRef.current = event.currentTarget;
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (isDuplicate) return;
        if (!toggleOnClick) return;
        state.toggle();
      },
      [
        state.disclosureRef,
        onClickProp,
        isDuplicate,
        toggleOnClick,
        state.toggle,
      ]
    );

    props = {
      "data-disclosure": "",
      "aria-expanded": expanded,
      "aria-controls": state.contentElement?.id,
      ...props,
      ref: useForkRef(ref, props.ref),
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
  toggleOnClick?: boolean;
};

export type DisclosureProps<T extends As = "button"> = Props<
  DisclosureOptions<T>
>;
