import * as React from "react";
import { useHook } from "../theme/_useHook";
import { mergeProps } from "../utils/mergeProps";
import { useBox, UseBoxOptions, UseBoxProps } from "../box/useBox";
import { useHiddenState, HiddenState, HiddenActions } from "./useHiddenState";

export type UseHiddenOptions = UseBoxOptions &
  Partial<HiddenState & HiddenActions> & {
    /** TODO: Description */
    hideOnEsc?: boolean;
    /** TODO: Description */
    hideOnClickOutside?: boolean;
  };

export type UseHiddenProps = UseBoxProps;

export function useHidden(
  options: UseHiddenOptions = {},
  props: UseHiddenProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!options.hideOnEsc) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && options.visible && options.hide) {
        options.hide();
      }
    };
    document.body.addEventListener("keydown", handleKeyDown);
    return () => document.body.removeEventListener("keydown", handleKeyDown);
  }, [options.hideOnEsc, options.visible, options.hide]);

  React.useEffect(() => {
    if (!options.hideOnClickOutside) return undefined;
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
  }, [ref, options.hideOnClickOutside, options.visible, options.hide]);

  props = mergeProps(
    {
      ref,
      "aria-hidden": !options.visible,
      hidden: !options.visible
    } as typeof props,
    props
  );
  props = useBox(options, props);
  props = useHook("useHidden", options, props);
  return props;
}

const keys: Array<keyof UseHiddenOptions> = [
  ...useBox.keys,
  ...useHiddenState.keys,
  "hideOnEsc",
  "hideOnClickOutside"
];

useHidden.keys = keys;
