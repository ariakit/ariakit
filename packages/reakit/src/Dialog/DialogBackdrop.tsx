import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { Portal } from "../Portal/Portal";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { Keys } from "../__utils/types";
import { useDialogState, unstable_DialogStateReturn } from "./DialogState";

export type unstable_DialogBackdropOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn>;

export type unstable_DialogBackdropProps = unstable_HiddenProps;

export function useDialogBackdrop(
  options: unstable_DialogBackdropOptions = {},
  htmlProps: unstable_DialogBackdropProps = {}
) {
  options = unstable_useOptions("useDialogBackdrop", options, htmlProps);

  htmlProps = mergeProps(
    {
      id: undefined,
      role: undefined,
      style: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(options, htmlProps);
  htmlProps = unstable_useProps("useDialogBackdrop", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_DialogBackdropOptions> = [
  ...useHidden.__keys,
  ...useDialogState.__keys
];

useDialogBackdrop.__keys = keys;

export const DialogBackdrop = unstable_createComponent({
  as: "div",
  useHook: useDialogBackdrop,
  useCreateElement: (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
});
