import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type SeparatorOptions = BoxOptions & {
  /**
   * Separator's orientation.
   */
  orientation?: "horizontal" | "vertical";
};

export type SeparatorHTMLProps = BoxHTMLProps;

export type SeparatorProps = SeparatorOptions & SeparatorHTMLProps;

export const useSeparator = unstable_createHook<
  SeparatorOptions,
  SeparatorHTMLProps
>({
  name: "Separator",
  compose: useBox,
  keys: ["orientation"],

  useOptions({ orientation = "horizontal", ...options }) {
    return { orientation, ...options };
  },

  useProps(options, htmlProps) {
    return {
      role: "separator",
      "aria-orientation": options.orientation,
      ...htmlProps
    };
  }
});

export const Separator = unstable_createComponent({
  as: "hr",
  useHook: useSeparator
});
