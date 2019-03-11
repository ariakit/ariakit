import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../Button/Button";
import { useHiddenState, unstable_HiddenStateReturn } from "./HiddenState";

export type unstable_HiddenDisclosureOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "toggle" | "refId">;

export type unstable_HiddenDisclosureProps = unstable_ButtonProps;

export function useHiddenDisclosure(
  options: unstable_HiddenDisclosureOptions,
  htmlProps: unstable_HiddenDisclosureProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: options.toggle,
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.refId
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useHiddenDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenDisclosureOptions> = [
  ...useButton.keys,
  ...useHiddenState.keys
];

useHiddenDisclosure.keys = keys;

export const HiddenDisclosure = unstable_createComponent(
  "button",
  useHiddenDisclosure
);
