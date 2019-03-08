import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useHook } from "../system/useHook";
import { unstable_Portal as Portal } from "../portal/Portal";
import { useDialogState, unstable_DialogStateReturn } from "./useDialogState";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../hidden/Hidden";

export type unstable_DialogBackdropOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> &
  Pick<unstable_DialogStateReturn, "unstable_setModal" | "hide">;

export type unstable_DialogBackdropProps = unstable_HiddenProps;

export function useDialogBackdrop(
  options: unstable_DialogBackdropOptions,
  htmlProps: unstable_DialogBackdropProps = {}
) {
  React.useLayoutEffect(() => {
    options.unstable_setModal(true);
    return () => options.unstable_setModal(false);
  }, [options.unstable_modal, options.unstable_setModal]);

  htmlProps = mergeProps(
    {
      role: "presentation",
      tabIndex: -1,
      onClick: options.hide
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(options, htmlProps);
  htmlProps = unstable_useHook("useDialogBackdrop", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogBackdropOptions> = [
  ...useHidden.keys,
  ...useDialogState.keys
];

useDialogBackdrop.keys = keys;

export const DialogBackdrop = unstable_createComponent(
  "div",
  useDialogBackdrop,
  // @ts-ignore: TODO typeof createElement
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
