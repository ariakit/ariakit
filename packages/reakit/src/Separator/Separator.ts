import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { RoleOptions, RoleHTMLProps, useRole } from "../Role/Role";
import { SEPARATOR_KEYS } from "./__keys";

export type SeparatorOptions = RoleOptions & {
  /**
   * Separator's orientation.
   */
  orientation?: "horizontal" | "vertical";
};

export type SeparatorHTMLProps = RoleHTMLProps;

export type SeparatorProps = SeparatorOptions & SeparatorHTMLProps;

export const useSeparator = createHook<SeparatorOptions, SeparatorHTMLProps>({
  name: "Separator",
  compose: useRole,
  keys: SEPARATOR_KEYS,

  useProps(options, htmlProps) {
    const { as } = options;
    const isHr = isString(as) && as === "hr";

    return {
      role: !isHr ? "separator" : undefined,
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

function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}
