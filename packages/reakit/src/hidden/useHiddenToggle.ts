import { useHook } from "../theme/_useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  UseButtonOptions,
  UseButtonProps
} from "../button/useButton";
import { useHiddenState, HiddenActions, HiddenState } from "./useHiddenState";

export type UseHiddenToggleOptions = UseButtonOptions &
  Partial<HiddenState & HiddenActions> &
  Pick<HiddenActions, "toggle">;

export type UseHiddenToggleProps = UseButtonProps &
  React.ButtonHTMLAttributes<any>;

export function useHiddenToggle(
  options: UseHiddenToggleOptions,
  props: UseHiddenToggleProps = {}
) {
  props = mergeProps(
    {
      onClick: options.toggle
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useHiddenToggle", options, props);
  return props;
}

const keys: Array<keyof UseHiddenToggleOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenToggle.keys = keys;
