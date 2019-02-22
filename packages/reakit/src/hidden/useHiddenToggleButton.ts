import useHook from "../theme/useHook";
import mergeProps from "../utils/mergeProps";
import useButton, {
  UseButtonOptions,
  UseButtonProps
} from "../button/useButton";
import useHiddenState, { HiddenActions, HiddenState } from "./useHiddenState";

export type UseHiddenToggleButtonOptions = UseButtonOptions &
  Partial<HiddenState & HiddenActions> &
  Pick<HiddenActions, "toggle">;

export type UseHiddenToggleButtonProps = UseButtonProps &
  React.ButtonHTMLAttributes<any>;

export function useHiddenToggleButton(
  options: UseHiddenToggleButtonOptions,
  props: UseHiddenToggleButtonProps = {}
) {
  props = mergeProps(
    {
      onClick: options.toggle
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useHiddenToggleButton", options, props);
  return props;
}

const keys: Array<keyof UseHiddenToggleButtonOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenToggleButton.keys = keys;

export default useHiddenToggleButton;
