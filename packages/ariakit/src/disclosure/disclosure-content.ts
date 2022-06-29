import {
  AnimationEvent,
  SyntheticEvent,
  TransitionEvent,
  useEffect,
  useRef,
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

    type TransitionState = "enter" | "leave" | null;
    const [transition, setTransition] = useState<TransitionState>(null);
    const raf = useRef(0);

    useEffect(() => {
      if (!state.animated) {
        setTransition(null);
        return;
      }
      // Double RAF is needed so the browser has enough time to paint the
      // default styles before processing the `data-enter` attribute. Otherwise
      // it wouldn't be considered a transition.
      // See https://github.com/ariakit/ariakit/issues/643
      raf.current = requestAnimationFrame(() => {
        raf.current = requestAnimationFrame(() => {
          if (state.open) {
            setTransition("enter");
          } else if (state.animating) {
            setTransition("leave");
          } else {
            setTransition(null);
          }
        });
      });
      return () => cancelAnimationFrame(raf.current);
    }, [state.animated, state.open, state.animating]);

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
