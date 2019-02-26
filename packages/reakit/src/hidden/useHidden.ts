import * as React from "react";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  unstable_UseBoxOptions,
  unstable_UseBoxProps,
  useBox
} from "../box/useBox";
import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions
} from "./useHiddenState";

export type unstable_UseHiddenOptions = unstable_UseBoxOptions &
  Partial<unstable_HiddenState & unstable_HiddenActions> & {
    /** @experimental */
    unstable_hideOnEsc?: boolean;
    /** @experimental */
    unstable_hideOnClickOutside?: boolean;
  };

export type unstable_UseHiddenProps = unstable_UseBoxProps;

export function useHidden(
  options: unstable_UseHiddenOptions = {},
  htmlProps: unstable_UseHiddenProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!options.unstable_hideOnEsc) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && options.visible && options.hide) {
        options.hide();
      }
    };
    document.body.addEventListener("keydown", handleKeyDown);
    return () => document.body.removeEventListener("keydown", handleKeyDown);
  }, [options.unstable_hideOnEsc, options.visible, options.hide]);

  React.useEffect(() => {
    if (!options.unstable_hideOnClickOutside) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      const el = ref.current;
      const shouldHide =
        el instanceof Element &&
        !el.contains(e.target as Node) &&
        options.visible &&
        options.hide;
      if (shouldHide) {
        // it's possible that the outside click was on a toggle button
        // in that case, we should "wait" before hiding it
        // otherwise it could hide before and then toggle, showing it again
        setTimeout(() => options.visible && options.hide && options.hide());
      }
    };
    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, [ref, options.unstable_hideOnClickOutside, options.visible, options.hide]);

  htmlProps = mergeProps(
    {
      ref,
      "aria-hidden": !options.visible,
      hidden: !options.visible
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useHidden", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_UseHiddenOptions> = [
  ...useBox.keys,
  ...useHiddenState.keys,
  "unstable_hideOnEsc",
  "unstable_hideOnClickOutside"
];

useHidden.keys = keys;
