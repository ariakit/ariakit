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
  unstable_StepActions,
  unstable_StepSelectors
} from "./useStepState";

export type unstable_UseStepNextOptions = unstable_UseButtonOptions &
  Partial<unstable_StepState & unstable_StepSelectors & unstable_StepActions> &
  Pick<unstable_StepActions, "next">;

export type unstable_UseStepNextProps = unstable_UseButtonProps;

export function useStepNext(
  options: unstable_UseStepNextOptions,
  htmlProps: unstable_UseStepNextProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.next
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useStepNext", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_UseStepNextOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepNext.keys = keys;
