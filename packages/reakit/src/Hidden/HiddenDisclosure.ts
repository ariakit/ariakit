import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  useButton,
  unstable_ButtonOptions,
  unstable_ButtonProps
} from "../Button/Button";
import { Keys } from "../__utils/types";
import { useHiddenState, unstable_HiddenStateReturn } from "./HiddenState";

export type unstable_HiddenDisclosureOptions = unstable_ButtonOptions &
  Partial<unstable_HiddenStateReturn> &
  Pick<unstable_HiddenStateReturn, "toggle" | "unstable_hiddenId">;

export type unstable_HiddenDisclosureProps = unstable_ButtonProps;

export function useHiddenDisclosure(
  options: unstable_HiddenDisclosureOptions,
  htmlProps: unstable_HiddenDisclosureProps = {}
) {
  options = unstable_useOptions("useHiddenDisclosure", options, htmlProps);
  htmlProps = mergeProps(
    {
      onClick: options.toggle,
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.unstable_hiddenId
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useProps("useHiddenDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_HiddenDisclosureOptions> = [
  ...useButton.__keys,
  ...useHiddenState.__keys
];

useHiddenDisclosure.__keys = keys;

export const HiddenDisclosure = unstable_createComponent({
  as: "button",
  useHook: useHiddenDisclosure
});
