import { unstable_useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  unstable_UseButtonOptions,
  unstable_UseButtonProps
} from "../button/useButton";
import {
  useStepState,
  unstable_StepState,
  unstable_StepActions,
  unstable_StepSelectors
} from "./useStepState";

export type unstable_UseStepNextOptions = unstable_UseButtonOptions &
  Partial<unstable_StepState & unstable_StepSelectors & unstable_StepActions> &
  Pick<unstable_StepActions, "next">;

export type unstable_UseStepNextProps = unstable_UseButtonProps;

export function useStepNext(
  options: unstable_UseStepNextOptions,
  props: unstable_UseStepNextProps = {}
) {
  props = mergeProps(
    {
      onClick: options.next
    } as typeof props,
    props
  );
  props = useButton(options, props);
  props = unstable_useHook("useStepNext", options, props);
  return props;
}

const keys: Array<keyof unstable_UseStepNextOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepNext.keys = keys;
