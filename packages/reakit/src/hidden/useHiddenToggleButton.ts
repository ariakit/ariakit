import { HiddenActions } from "./useHiddenState";
import { UseBoxOptions, UseBoxProps } from "../box";
import { useHook } from "../theme";
import { mergeProps } from "../utils";
import { useButton } from "../button";

export type UseHiddenToggleButtonOptions = UseBoxOptions &
  Pick<HiddenActions, "toggle">;

export type UseHiddenToggleButtonProps = UseBoxProps &
  React.ButtonHTMLAttributes<any>;

export function useHiddenToggleButton(
  options: UseHiddenToggleButtonOptions,
  props: UseHiddenToggleButtonProps = {}
) {
  props = mergeProps<typeof props>(
    {
      onClick: options.toggle
    },
    props
  );
  props = useButton(options, props);
  props = useHook("useHiddenToggleButton", options, props);
  return props;
}

export default useHiddenToggleButton;
