import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { SEPARATOR_KEYS } from "./__keys";

export type SeparatorOptions = BoxOptions & {
  /**
   * Separator's orientation.
   */
  orientation?: "horizontal" | "vertical";
};

export type SeparatorHTMLProps = BoxHTMLProps;

export type SeparatorProps = SeparatorOptions & SeparatorHTMLProps;

export const useSeparator = createHook<SeparatorOptions, SeparatorHTMLProps>({
  name: "Separator",
  compose: useBox,
  keys: SEPARATOR_KEYS,

  useOptions({ orientation = "horizontal", ...options }) {
    return { orientation, ...options };
  },

  useProps(options, htmlProps) {
    return {
      role: "separator",
      "aria-orientation": options.orientation,
      ...htmlProps,
    };
  },
});

export const Separator = createComponent({
  as: "hr",
  memo: true,
  useHook: useSeparator,
});
