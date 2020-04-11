import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { cx } from "reakit-utils/cx";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useDisclosureState, DisclosureStateReturn } from "./DisclosureState";

export type DisclosureContentOptions = BoxOptions &
  Pick<
    Partial<DisclosureStateReturn>,
    | "baseId"
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_stopAnimation"
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
      className: htmlClassName,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const [hiddenClass, setHiddenClass] = React.useState<string | null>(null);
    const animating = options.unstable_animated && options.unstable_animating;
    const hidden = !options.visible && !animating;
    const onTransitionEndRef = useLiveRef(htmlOnTransitionEnd);
    const onAnimationEndRef = useLiveRef(htmlOnAnimationEnd);
    const style = hidden ? { display: "none", ...htmlStyle } : htmlStyle;

    React.useEffect(() => {
      setHiddenClass(!options.visible ? "hidden" : null);
    }, [options.visible]);

    const onEnd = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (!isSelfTarget(event)) return;
        if (options.unstable_animated) {
          options.unstable_stopAnimation?.();
        }
      },
      [options.unstable_animated, options.unstable_stopAnimation]
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
      className: cx(hiddenClass, htmlClassName),
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
