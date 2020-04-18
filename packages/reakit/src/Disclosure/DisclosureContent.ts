import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useDisclosureState, DisclosureStateReturn } from "./DisclosureState";

export type DisclosureContentOptions = BoxOptions &
  Pick<
    Partial<DisclosureStateReturn>,
    "baseId" | "visible" | "animating" | "animated" | "stopAnimation"
  >;

export type DisclosureContentHTMLProps = BoxHTMLProps;

export type DisclosureContentProps = DisclosureContentOptions &
  DisclosureContentHTMLProps;

type TransitionState = "enter" | "leave" | null;

export const useDisclosureContent = createHook<
  DisclosureContentOptions,
  DisclosureContentHTMLProps
>({
  name: "DisclosureContent",
  compose: useBox,
  useState: useDisclosureState,

  useProps(
    options,
    {
      onTransitionEnd: htmlOnTransitionEnd,
      onAnimationEnd: htmlOnAnimationEnd,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const animating = options.animated && options.animating;
    const [transition, setTransition] = React.useState<TransitionState>(null);
    const hidden = !options.visible && !animating;
    const style = hidden ? { display: "none", ...htmlStyle } : htmlStyle;
    const onTransitionEndRef = useLiveRef(htmlOnTransitionEnd);
    const onAnimationEndRef = useLiveRef(htmlOnAnimationEnd);

    React.useEffect(() => {
      if (!options.animated) return undefined;
      const raf = window.requestAnimationFrame(() => {
        if (options.visible) {
          setTransition("enter");
        } else if (animating) {
          setTransition("leave");
        } else {
          setTransition(null);
        }
      });
      return () => window.cancelAnimationFrame(raf);
    }, [options.animated, options.visible, animating]);

    const onEnd = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (!isSelfTarget(event)) return;
        if (!animating) return;
        // Ignores number animated
        if (options.animated === true) {
          options.stopAnimation?.();
        }
      },
      [options.animated, animating, options.stopAnimation]
    );

    const onTransitionEnd = React.useCallback(
      (event: React.TransitionEvent) => {
        onTransitionEndRef.current?.(event);
        onEnd(event);
      },
      [onEnd]
    );

    const onAnimationEnd = React.useCallback(
      (event: React.AnimationEvent) => {
        onAnimationEndRef.current?.(event);
        onEnd(event);
      },
      [onEnd]
    );

    return {
      id: options.baseId,
      "data-enter": transition === "enter" ? "" : undefined,
      "data-leave": transition === "leave" ? "" : undefined,
      onTransitionEnd,
      onAnimationEnd,
      hidden,
      style,
      ...htmlProps,
    };
  },
});

export const DisclosureContent = createComponent({
  as: "div",
  useHook: useDisclosureContent,
});
