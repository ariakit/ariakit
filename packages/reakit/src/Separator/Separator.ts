import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

export type unstable_SeparatorOptions = unstable_BoxOptions & {
  /** TODO: Description */
  orientation?: "horizontal" | "vertical";
};

export type unstable_SeparatorProps = unstable_BoxProps;

export function useSeparator(
  { orientation = "vertical", ...options }: unstable_SeparatorOptions = {},
  htmlProps: unstable_SeparatorProps = {}
) {
  const flipMap = {
    horizontal: "vertical",
    vertical: "horizontal"
  };

  htmlProps = mergeProps(
    {
      role: "separator",
      "aria-orientation": flipMap[orientation]
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_SeparatorOptions> = [
  ...useBox.keys,
  "orientation"
];

useSeparator.keys = keys;

export const Separator = unstable_createComponent("hr", useSeparator);
