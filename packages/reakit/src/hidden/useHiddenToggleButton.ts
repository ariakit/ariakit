import { HiddenState } from "./useHiddenState";
import { UseBoxOptions, UseBoxProps } from "../box";
import { useHook } from "../theme";
import { mergeProps } from "../utils";
import { useButton } from "../elements";

export type UseHiddenToggleButtonOptions = UseBoxOptions &
  Pick<HiddenState, "toggle">;

export type UseHiddenToggleButtonProps = UseBoxProps &
  React.ButtonHTMLAttributes<any>;

export function useHiddenToggleButton(
  options: UseHiddenToggleButtonOptions,
  props: UseHiddenToggleButtonProps = {}
) {
  let buttonProps = mergeProps(
    {
      onClick: options.toggle
    },
    props
  );
  buttonProps = useButton(options, buttonProps);
  buttonProps = useHook("useHiddenToggleButton", options, buttonProps);
  return buttonProps;
}

export default useHiddenToggleButton;
