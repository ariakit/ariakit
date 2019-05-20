import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { cx } from "../__utils/cx";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenOptions = BoxOptions &
  Pick<Partial<HiddenStateReturn>, "unstable_hiddenId" | "visible"> & {
    /**
     * If `true`, the hidden element attributes will be set in different
     * timings to enable CSS transitions. This means that you can safely use the `.hidden` selector in the CSS to
     * create transitions.
     *  - When it becomes visible, immediatelly remove the `hidden` attribute,
     * then add the `hidden` class.
     *  - When it becomes hidden, immediatelly remove the `hidden` class, then
     * add the `hidden` attribute.
     */
    unstable_animated?: boolean;
  };

export type HiddenHTMLProps = BoxHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = unstable_createHook<HiddenOptions, HiddenHTMLProps>({
  name: "Hidden",
  compose: useBox,
  useState: useHiddenState,
  keys: ["unstable_animated"],

  useProps(
    options,
    {
      onTransitionEnd: htmlOnTransitionEnd,
      className: htmlClassName,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const [delayedVisible, setDelayedVisible] = React.useState(options.visible);

    React.useEffect(() => {
      if (options.unstable_animated && options.visible) {
        setDelayedVisible(options.visible);
      }
    }, [options.visible, options.unstable_animated]);

    const onTransitionEnd = React.useCallback(() => {
      if (options.unstable_animated && !options.visible) {
        setDelayedVisible(options.visible);
      }
    }, [options.visible, options.unstable_animated]);

    // delays hiding
    const hidden = options.unstable_animated
      ? options.visible
        ? false
        : !delayedVisible
      : !options.visible;

    // delays showing
    const shouldAddHiddenClass = options.unstable_animated
      ? options.visible
        ? !delayedVisible
        : true
      : !options.visible;

    return {
      role: "region",
      id: options.unstable_hiddenId,
      className: cx(shouldAddHiddenClass && "hidden", htmlClassName),
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

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
