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
  StepActions,
  StepSelectors
} from "./useStepState";

export type UseStepNextOptions = UseButtonOptions &
  Partial<StepState & StepSelectors & StepActions> &
  Pick<StepActions, "next">;

export type UseStepNextProps = UseButtonProps;

export function useStepNext(
  options: UseStepNextOptions,
  props: UseStepNextProps
) {
  props = mergeProps(
    {
      onClick: options.next
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useStepNext", options, props);
  return props;
}

const keys: Array<keyof UseStepNextOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepNext.keys = keys;
