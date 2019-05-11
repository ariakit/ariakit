import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
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

  propsAreEqual(prev, next) {
    if (prev.visible === false && next.visible === false) {
      return true;
    }
    return null;
  },

  useProps(options, htmlProps) {
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

    return mergeProps(
      {
        role: "region",
        id: options.unstable_hiddenId,
        className: shouldAddHiddenClass ? "hidden" : undefined,
        hidden,
        onTransitionEnd
      } as HiddenHTMLProps,
      htmlProps
    );
  }
});

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
