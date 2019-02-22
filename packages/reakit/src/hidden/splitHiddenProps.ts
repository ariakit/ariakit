import { splitBoxProps } from "../box";
import { HiddenState, HiddenActions } from "./useHiddenState";
import { UseHiddenOptions } from "./useHidden";
import { UseHiddenToggleButtonOptions } from "./useHiddenToggleButton";

export function splitHiddenProps<
  P extends Partial<
    HiddenState &
      HiddenActions &
      UseHiddenOptions &
      UseHiddenToggleButtonOptions
  >,
  K extends keyof P = never
>(props: P, keys: K[] = []) {
  return splitBoxProps(props, [
    "visible",
    "show",
    "hide",
    "toggle",
    "hideOnEsc",
    "hideOnClickOutside",
    ...keys
  ]);
}

export default splitHiddenProps;
