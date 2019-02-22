import { StepActions } from "./useStepState";
import { useHook } from "../theme";
import { UseButtonOptions, UseButtonProps, useButton } from "../button";
import { mergeProps } from "../utils";

export type UseStepPreviousButtonOptions = UseButtonOptions &
  Pick<StepActions, "previous">;

export type UseStepPreviousButtonProps = UseButtonProps;

export function useStepPreviousButton(
  options: UseStepPreviousButtonOptions,
  props: UseStepPreviousButtonProps
) {
  props = mergeProps<typeof props>(
    {
      onClick: options.previous
    },
    props
  );
  props = useButton(options, props);
  props = useHook("useStepPreviousButton", options, props);
  return props;
}

export default useStepPreviousButton;
