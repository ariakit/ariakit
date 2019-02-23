import { useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  UseButtonOptions,
  UseButtonProps
} from "../button/useButton";
import {
  useStepState,
  StepState,
  StepSelectors,
  StepActions
} from "./useStepState";

export type UseStepPreviousOptions = UseButtonOptions &
  Partial<StepState & StepSelectors & StepActions> &
  Pick<StepActions, "previous">;

export type UseStepPreviousProps = UseButtonProps;

export function useStepPrevious(
  options: UseStepPreviousOptions,
  props: UseStepPreviousProps
) {
  props = mergeProps(
    {
      onClick: options.previous
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useStepPrevious", options, props);
  return props;
}

const keys: Array<keyof UseStepPreviousOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepPrevious.keys = keys;
