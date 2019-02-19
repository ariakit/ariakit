import { HiddenState } from "./useHiddenState";
import { BoxOptions, BoxAttributes } from "../box";
import { useThemeHook } from "../theme";
import { mergeProps } from "../utils";
import { useButtonProps } from "../elements";

export type HiddenButtonOptions = BoxOptions & Pick<HiddenState, "toggle">;

export type HiddenButtonAttributes = BoxAttributes &
  React.ButtonHTMLAttributes<any>;

export function useHiddenButtonProps(
  options: HiddenButtonOptions,
  props: HiddenButtonAttributes = {}
) {
  props = mergeProps(
    {
      onClick: options.toggle
    },
    props
  );
  props = useButtonProps(options, props);
  props = useThemeHook("useHiddenButtonProps", options, props);
  return props;
}

export default useHiddenButtonProps;
