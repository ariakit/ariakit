import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useStepState, unstable_StepStateReturn } from "./useStepState";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../button/Button";

export type unstable_StepPreviousOptions = unstable_ButtonOptions &
  Partial<unstable_StepStateReturn> &
  Pick<unstable_StepStateReturn, "previous">;

export type unstable_StepPreviousProps = unstable_ButtonProps;

export function useStepPrevious(
  options: unstable_StepPreviousOptions,
  htmlProps: unstable_StepPreviousProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.previous
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useStepPrevious", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_StepPreviousOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepPrevious.keys = keys;

export const StepPrevious = unstable_createComponent("button", useStepPrevious);
