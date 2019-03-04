import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  unstable_UseButtonOptions,
  unstable_UseButtonProps
} from "../button/useButton";
import {
  useHiddenState,
  unstable_HiddenActions,
  unstable_HiddenState
} from "./useHiddenState";

export type unstable_UseHiddenToggleOptions = unstable_UseButtonOptions &
  Partial<unstable_HiddenState & unstable_HiddenActions> &
  Pick<unstable_HiddenActions, "toggle">;

export type unstable_UseHiddenToggleProps = unstable_UseButtonProps;

export function useHiddenToggle(
  options: unstable_UseHiddenToggleOptions,
  htmlProps: unstable_UseHiddenToggleProps = {}
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

const keys: Array<keyof unstable_UseHiddenToggleOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenToggle.keys = keys;
