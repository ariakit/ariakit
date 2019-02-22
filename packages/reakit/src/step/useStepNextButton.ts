import useHook from "../theme/useHook";
import mergeProps from "../utils/mergeProps";
import useButton, {
  UseButtonOptions,
  UseButtonProps
} from "../button/useButton";
import useStepState, {
  StepState,
  StepActions,
  StepSelectors
} from "./useStepState";

export type UseStepNextButtonOptions = UseButtonOptions &
  Partial<StepState & StepSelectors & StepActions> &
  Pick<StepActions, "next">;

export type UseStepNextButtonProps = UseButtonProps;

export function useStepNextButton(
  options: UseStepNextButtonOptions,
  props: UseStepNextButtonProps
) {
  props = mergeProps(
    {
      onClick: options.next
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = useHook("useStepNextButton", options, props);
  return props;
}

const keys: Array<keyof UseStepNextButtonOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepNextButton.keys = keys;

export default useStepNextButton;
