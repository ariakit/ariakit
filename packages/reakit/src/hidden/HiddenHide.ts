import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useHiddenState, unstable_HiddenStateReturn } from "./useHiddenState";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../button/Button";

export type unstable_HiddenHideOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "hide">;

export type unstable_HiddenHideProps = unstable_ButtonProps;

export function useHiddenHide(
  options: unstable_HiddenHideOptions,
  htmlProps: unstable_HiddenHideProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.hide
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useHiddenHide", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenHideOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenHide.keys = keys;

export const HiddenHide = unstable_createComponent("button", useHiddenHide);
