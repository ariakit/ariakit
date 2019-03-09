import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../Button/Button";
import { useStepState, unstable_StepStateReturn } from "./StepState";

export type unstable_StepNextOptions = unstable_ButtonOptions &
  Partial<unstable_StepStateReturn> &
  Pick<unstable_StepStateReturn, "next">;

export type unstable_StepNextProps = unstable_ButtonProps;

export function useStepNext(
  options: unstable_StepNextOptions,
  htmlProps: unstable_StepNextProps = {}
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

const keys: Array<keyof unstable_StepNextOptions> = [
  ...useButton.keys,
  ...useStepState.keys
];

useStepNext.keys = keys;

export const StepNext = unstable_createComponent("button", useStepNext);
