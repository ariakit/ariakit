import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { cx } from "reakit-utils/cx";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps,
  unstable_useIdGroup
} from "../Id/IdGroup";
import { useDisclosureState, DisclosureStateReturn } from "./DisclosureState";
import { useWarningIfMultiple } from "./__utils/useWarningIfMultiple";
import { useSetIsMounted } from "./__utils/useSetIsMounted";

export type DisclosureContentOptions = unstable_IdGroupOptions &
  Pick<
    Partial<DisclosureStateReturn>,
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_stopAnimation"
    | "unstable_setIsMounted"
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

    useWarningIfMultiple(options);
    useSetIsMounted(options);

    React.useEffect(() => {
      setHiddenClass(!options.visible ? "hidden" : null);
    }, [options.visible]);

    const onTransitionEnd = React.useCallback(
      (event: React.TransitionEvent) => {
        if (event.currentTarget !== event.target) return;

        if (options.unstable_animated && options.unstable_stopAnimation) {
          options.unstable_stopAnimation();
        }
      },
      [options.unstable_animated, options.unstable_stopAnimation]
    );

    const animating = options.unstable_animated && options.unstable_animating;
    const hidden = !options.visible && !animating;

    return {
      id: options.baseId,
      className: cx(hiddenClass, htmlClassName),
      onAnimationEnd: useAllCallbacks(onTransitionEnd, htmlOnAnimationEnd),
      onTransitionEnd: useAllCallbacks(onTransitionEnd, htmlOnTransitionEnd),
      hidden,
      ...(hidden
        ? { style: { display: "none", ...htmlStyle } }
        : htmlStyle
        ? { style: htmlStyle }
        : {}),
      ...htmlProps
    };
  }
});

export const DisclosureContent = createComponent({
  as: "div",
  useHook: useDisclosureContent
});
