import { unstable_createComponent } from "../utils/createComponent";
import { useButton, ButtonOptions, ButtonHTMLProps } from "../Button/Button";
import { unstable_createHook } from "../utils/createHook";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
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

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    return {
      onClick: useAllCallbacks(options.toggle, htmlOnClick),
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.unstable_hiddenId,
      ...htmlProps
    };
  }
});

export const HiddenDisclosure = unstable_createComponent({
  as: "button",
  useHook: useHiddenDisclosure
});
