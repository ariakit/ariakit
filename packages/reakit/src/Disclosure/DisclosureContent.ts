import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
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
    const [beforeVisible, setBeforeVisible] = React.useState(false);
    const [delayedVisible, setDelayedVisible] = React.useState(false);
    const hidden = !options.visible && !animating;
    const style = hidden ? { display: "none", ...htmlStyle } : htmlStyle;
    const onTransitionEndRef = useLiveRef(htmlOnTransitionEnd);
    const onAnimationEndRef = useLiveRef(htmlOnAnimationEnd);

    React.useEffect(() => {
      setBeforeVisible(!options.visible && !animating);
    }, [options.visible, animating]);

    React.useEffect(() => {
      setDelayedVisible(!!options.visible);
    }, [options.visible]);

    const onEnd = React.useCallback(() => {
      if (animating) {
        options.stopAnimation?.();
      }
    }, [animating, options.stopAnimation]);

    const onTransitionEnd = React.useCallback(
      (event: React.TransitionEvent) => {
        onTransitionEndRef.current?.(event);
        onEnd();
      },
      [onEnd]
    );

    const onAnimationEnd = React.useCallback(
      (event: React.AnimationEvent) => {
        onAnimationEndRef.current?.(event);
        onEnd();
      },
      [onEnd]
    );

    return {
      id: options.baseId,
      "data-before-visible": beforeVisible || undefined,
      "data-visible": delayedVisible || undefined,
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
