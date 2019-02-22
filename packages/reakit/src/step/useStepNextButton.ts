import { StepActions } from "./useStepState";
import { useHook } from "../theme";
import { UseButtonOptions, UseButtonProps, useButton } from "../button";
import { mergeProps } from "../utils";

export type UseStepNextButtonOptions = UseButtonOptions &
  Pick<StepActions, "next">;

export type UseStepNextButtonProps = UseButtonProps;

export function useStepNextButton(
  options: UseStepNextButtonOptions,
  props: UseStepNextButtonProps
) {
  props = mergeProps<typeof props>(
    {
      onClick: options.next
    },
    props
  );
  props = useButton(options, props);
  props = useHook("useStepNextButton", options, props);
  return props;
}

export default useStepNextButton;
