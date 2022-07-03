import {
  AnimationEvent,
  SyntheticEvent,
  TransitionEvent,
  useEffect,
  useState,
} from "react";
import { isSelfTarget } from "ariakit-utils/events";
import { useEvent, useForkRef, useId } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { DisclosureState } from "./disclosure-state";

type TransitionState = "enter" | "leave" | null;

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that can be shown or hidden.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const state = useDisclosureState();
 * const props = useDisclosureContent({ state });
 * <Disclosure state={state}>Disclosure</Disclosure>
 * <Role {...props}>Content</Role>
 * ```
 */
export const useDisclosureContent = createHook<DisclosureContentOptions>(
  ({ state, ...props }) => {
    const id = useId(props.id);
    const [transition, setTransition] = useState<TransitionState>(null);

    useEffect(() => {
      // When the disclosure content element is rendered in a portal, we need to
      // wait for the portal to be mounted and connected to the DOM before we
      // can start the animation.
      if (!state.animated || !state.contentElement?.isConnected) {
        return setTransition(null);
      }
      if (state.open) {
        // Double requestAnimationFrame is necessary here to avoid potential
        // bugs when the data attribute is added before the element is fully
        // rendered in the DOM, which wouldn't trigger the animation.
        let raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => {
            setTransition("enter");
          });
        });
        return () => cancelAnimationFrame(raf);
      }
      setTransition(state.animating ? "leave" : null);
      return () => setTransition(null);
    }, [state.animated, state.contentElement, state.open, state.animating]);

    const onEnd = (event: SyntheticEvent) => {
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      if (!state.animating) return;
      // Ignores number animated
      if (state.animated === true) {
        state.stopAnimation();
      }
    };

    const onTransitionEndProp = props.onTransitionEnd;

    const onTransitionEnd = useEvent(
      (event: TransitionEvent<HTMLDivElement>) => {
        onTransitionEndProp?.(event);
        onEnd(event);
      }
    );

    const onAnimationEndProp = props.onAnimationEnd;

    const onAnimationEnd = useEvent((event: AnimationEvent<HTMLDivElement>) => {
      onAnimationEndProp?.(event);
      onEnd(event);
    });

    const style =
      state.mounted || props.hidden === false
        ? props.style
        : { ...props.style, display: "none" };

    props = {
      id,
      "data-enter": transition === "enter" ? "" : undefined,
      "data-leave": transition === "leave" ? "" : undefined,
      hidden: !state.mounted,
      ...props,
      ref: useForkRef(id ? state.setContentElement : null, props.ref),
      onTransitionEnd,
      onAnimationEnd,
      style,
    };

    return props;
  }
);

/**
 * A component that renders an element that can be shown or hidden.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureState();
 * <Disclosure state={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent state={disclosure}>Content</DisclosureContent>
 * ```
 */
export const DisclosureContent = createComponent<DisclosureContentOptions>(
  (props) => {
    const htmlProps = useDisclosureContent(props);
    return createElement("div", htmlProps);
  }
);

export type DisclosureContentOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useDisclosureState` hook.
   */
  state: DisclosureState;
};

export type DisclosureContentProps<T extends As = "div"> = Props<
  DisclosureContentOptions<T>
>;
