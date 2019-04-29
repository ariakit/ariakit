import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
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

export type SeparatorProps = BoxProps;

export const useSeparator = unstable_createHook<
  SeparatorOptions,
  SeparatorProps
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

    return mergeProps(
      {
        role: "separator",
        "aria-orientation": options.orientation
          ? flipMap[options.orientation]
          : undefined
      } as SeparatorProps,
      htmlProps
    );
  }
});

export const Separator = unstable_createComponent({
  as: "hr",
  useHook: useSeparator
});
