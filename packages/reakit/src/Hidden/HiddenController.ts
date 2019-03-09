import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useHiddenState, unstable_HiddenStateReturn } from "./useHiddenState";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../Button/Button";

export type unstable_HiddenControllerOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "toggle" | "baseId">;

export type unstable_HiddenControllerProps = unstable_ButtonProps;

export function useHiddenController(
  options: unstable_HiddenControllerOptions,
  htmlProps: unstable_HiddenControllerProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.toggle,
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.baseId
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useHiddenController", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenControllerOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenController.keys = keys;

export const HiddenController = unstable_createComponent(
  "button",
  useHiddenController
);
