import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useHiddenState, unstable_HiddenStateReturn } from "./useHiddenState";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../button/Button";

export type unstable_HiddenShowOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "show">;

export type unstable_HiddenShowProps = unstable_ButtonProps;

export function useHiddenShow(
  options: unstable_HiddenShowOptions,
  htmlProps: unstable_HiddenShowProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.show
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useHiddenShow", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenShowOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenShow.keys = keys;

export const HiddenShow = unstable_createComponent("button", useHiddenShow);
