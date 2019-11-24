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
import { useHiddenState, HiddenStateReturn } from "./HiddenState";
import { useWarningIfMultiple } from "./__utils/useWarningIfMultiple";
import { useSetIsMounted } from "./__utils/useSetIsMounted";

export type HiddenOptions = unstable_IdGroupOptions &
  Pick<
    Partial<HiddenStateReturn>,
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_stopAnimation"
    | "unstable_setIsMounted"
  >;

export type HiddenHTMLProps = unstable_IdGroupHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = createHook<HiddenOptions, HiddenHTMLProps>({
  name: "Hidden",
  compose: unstable_useIdGroup,
  useState: useHiddenState,

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

    const onTransitionEnd = React.useCallback(() => {
      if (options.unstable_animated && options.unstable_stopAnimation) {
        options.unstable_stopAnimation();
      }
    }, [options.unstable_animated, options.unstable_stopAnimation]);

    const animating = options.unstable_animated && options.unstable_animating;
    const hidden = !options.visible && !animating;

    return {
      role: "region",
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

export const Hidden = createComponent({
  as: "div",
  useHook: useHidden
});
