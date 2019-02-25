import { unstable_useHook } from "../theme/useHook";
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
  props: unstable_UseHiddenToggleProps = {}
) {
  props = mergeProps(
    {
      onClick: options.toggle
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = unstable_useHook("useHiddenToggle", options, props);
  return props;
}

const keys: Array<keyof unstable_UseHiddenToggleOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenToggle.keys = keys;
