import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useButton, ButtonOptions, ButtonHTMLProps } from "../Button/Button";
import { unstable_createHook } from "../utils/createHook";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenDisclosureOptions = ButtonOptions &
  Pick<Partial<HiddenStateReturn>, "visible"> &
  Pick<HiddenStateReturn, "toggle" | "unstable_hiddenId">;

export type HiddenDisclosureHTMLProps = ButtonHTMLProps;

export type HiddenDisclosureProps = HiddenDisclosureOptions &
  HiddenDisclosureHTMLProps;

export const useHiddenDisclosure = unstable_createHook<
  HiddenDisclosureOptions,
  HiddenDisclosureHTMLProps
>({
  name: "HiddenDisclosure",
  compose: useButton,
  useState: useHiddenState,

  useProps(options, htmlProps) {
    return mergeProps(
      {
        onClick: options.toggle,
        "aria-expanded": Boolean(options.visible),
        "aria-controls": options.unstable_hiddenId
      } as HiddenDisclosureHTMLProps,
      htmlProps
    );
  }
});

export const HiddenDisclosure = unstable_createComponent({
  as: "button",
  useHook: useHiddenDisclosure
});
