import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../box/Box";
import { useHiddenState, unstable_HiddenStateReturn } from "./useHiddenState";

export type unstable_HiddenOptions = unstable_BoxOptions &
  Partial<unstable_HiddenStateReturn>;

export type unstable_HiddenProps = unstable_BoxProps;

export function useHidden(
  options: unstable_HiddenOptions = {},
  htmlProps: unstable_HiddenProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);

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

const keys: Array<keyof unstable_HiddenOptions> = [
  ...useBox.keys,
  ...useHiddenState.keys
];

useHidden.keys = keys;

export const Hidden = unstable_createComponent("div", useHidden);
