import { unstable_createComponent } from "../utils/createComponent";
import { unstable_mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type SeparatorOptions = BoxOptions & {
  /**
   * Separator's context orientation.
   * The actual separator's orientation will be flipped based on this prop.
   * So a `"vertical"` orientation means that the separator will have a
   * `"horizontal"` orientation.
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

  useOptions({ orientation = "vertical", ...options }) {
    return { orientation, ...options };
  },

  useProps(options, htmlProps) {
    const flipMap = {
      horizontal: "vertical",
      vertical: "horizontal"
    };

    return unstable_mergeProps(
      {
        role: "separator",
        "aria-orientation": options.orientation
          ? flipMap[options.orientation]
          : undefined
      } as SeparatorHTMLProps,
      htmlProps
    );
  }
});

export const Separator = unstable_createComponent({
  as: "hr",
  useHook: useSeparator
});
