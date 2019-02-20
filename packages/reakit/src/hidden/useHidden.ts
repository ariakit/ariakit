import * as React from "react";
import { HiddenState } from "./useHiddenState";
import { useBox, UseBoxOptions, UseBoxProps } from "../box";
import { useHook } from "../theme";
import { mergeProps } from "../utils";

export type UseHiddenOptions = UseBoxOptions &
  Partial<Pick<HiddenState, "visible" | "hide">> & {
    hideOnEsc?: boolean;
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

  let hiddenProps = mergeProps<typeof props>(
    {
      ref,
      "aria-hidden": !options.visible,
      hidden: !options.visible
    },
    props
  );
  hiddenProps = useBox(options, hiddenProps);
  hiddenProps = useHook("useHidden", options, hiddenProps);
  return hiddenProps;
}

export default useHidden;
