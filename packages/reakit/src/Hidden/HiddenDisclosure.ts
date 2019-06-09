import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { useButton, ButtonOptions, ButtonHTMLProps } from "../Button/Button";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenDisclosureOptions = ButtonOptions &
  Pick<Partial<HiddenStateReturn>, "visible"> &
  Pick<HiddenStateReturn, "toggle" | "unstable_hiddenId">;

export type HiddenDisclosureHTMLProps = ButtonHTMLProps;

export type HiddenDisclosureProps = HiddenDisclosureOptions &
  HiddenDisclosureHTMLProps;

export const useHiddenDisclosure = createHook<
  HiddenDisclosureOptions,
  HiddenDisclosureHTMLProps
>({
  name: "HiddenDisclosure",
  compose: useButton,
  useState: useHiddenState,

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    return {
      onClick: useAllCallbacks(options.toggle, htmlOnClick),
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.unstable_hiddenId,
      ...htmlProps
    };
  }
});

export const HiddenDisclosure = createComponent({
  as: "button",
  useHook: useHiddenDisclosure
});
