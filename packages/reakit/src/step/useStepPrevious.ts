import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  unstable_UseButtonOptions,
  unstable_UseButtonProps
} from "../button/useButton";
import {
  useStepState,
  unstable_StepState,
  unstable_StepSelectors,
  unstable_StepActions
} from "./useStepState";

export type unstable_UseStepPreviousOptions = unstable_UseButtonOptions &
  Partial<unstable_StepState & unstable_StepSelectors & unstable_StepActions> &
  Pick<unstable_StepActions, "previous">;

export type unstable_UseStepPreviousProps = unstable_UseButtonProps;

export function useStepPrevious(
  options: unstable_UseStepPreviousOptions,
  htmlProps: unstable_UseStepPreviousProps = {}
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

const keys: Array<keyof unstable_UseStepPreviousOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepPrevious.keys = keys;
