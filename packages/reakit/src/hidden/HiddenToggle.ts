import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useHiddenState, unstable_HiddenStateReturn } from "./useHiddenState";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../button/Button";

export type unstable_HiddenToggleOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "toggle">;

export type unstable_HiddenToggleProps = unstable_ButtonProps;

export function useHiddenToggle(
  options: unstable_HiddenToggleOptions,
  htmlProps: unstable_HiddenToggleProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.toggle
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useHiddenToggle", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenToggleOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenToggle.keys = keys;

export const HiddenToggle = unstable_createComponent("button", useHiddenToggle);
