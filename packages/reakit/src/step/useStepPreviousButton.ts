import useHook from "../theme/useHook";
import mergeProps from "../utils/mergeProps";
import useButton, {
  UseButtonOptions,
  UseButtonProps
} from "../button/useButton";
import useStepState, {
  StepState,
  StepSelectors,
  StepActions
} from "./useStepState";

export type UseStepPreviousButtonOptions = UseButtonOptions &
  Partial<StepState & StepSelectors & StepActions> &
  Pick<StepActions, "previous">;

export type UseStepPreviousButtonProps = UseButtonProps;

export function useStepPreviousButton(
  options: UseStepPreviousButtonOptions,
  props: UseStepPreviousButtonProps
) {
  props = mergeProps(
    {
      onClick: options.previous
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useStepPreviousButton", options, props);
  return props;
}

const keys: Array<keyof UseStepPreviousButtonOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepPreviousButton.keys = keys;

export default useStepPreviousButton;
