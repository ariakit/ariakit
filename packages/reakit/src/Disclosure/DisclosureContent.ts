import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { cx } from "reakit-utils/cx";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import {
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps,
  unstable_useIdGroup,
} from "../Id/IdGroup";
import { useDisclosureState, DisclosureStateReturn } from "./DisclosureState";

export type DisclosureContentOptions = unstable_IdGroupOptions &
  Pick<
    Partial<DisclosureStateReturn>,
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_stopAnimation"
  >;

export type DisclosureContentHTMLProps = unstable_IdGroupHTMLProps;

export type DisclosureContentProps = DisclosureContentOptions &
  DisclosureContentHTMLProps;

export const useDisclosureContent = createHook<
  DisclosureContentOptions,
  DisclosureContentHTMLProps
>({
  name: "DisclosureContent",
  compose: unstable_useIdGroup,
  useState: useDisclosureState,

  useProps(
    options,
    {
      onAnimationEnd: htmlOnAnimationEnd,
      onTransitionEnd: htmlOnTransitionEnd,
      className: htmlClassName,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const [hiddenClass, setHiddenClass] = React.useState<string | null>(null);
    const animating = options.unstable_animated && options.unstable_animating;
    const hidden = !options.visible && !animating;
    const style = hidden ? { display: "none", ...htmlStyle } : htmlStyle;

    React.useEffect(() => {
      setHiddenClass(!options.visible ? "hidden" : null);
    }, [options.visible]);

    const onEnd = (event: React.SyntheticEvent) => {
      if (!isSelfTarget(event)) return;
      if (options.unstable_animated && options.unstable_stopAnimation) {
        options.unstable_stopAnimation();
      }
    };

    const onTransitionEnd = (event: React.TransitionEvent) => {
      htmlOnTransitionEnd?.(event);
      onEnd(event);
    };

    const onAnimationEnd = (event: React.AnimationEvent) => {
      htmlOnAnimationEnd?.(event);
      onEnd(event);
    };

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
