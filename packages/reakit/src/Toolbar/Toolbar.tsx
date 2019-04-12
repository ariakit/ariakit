import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type ToolbarOptions = BoxOptions &
  Pick<Partial<ToolbarStateReturn>, "orientation">;

export type ToolbarProps = BoxProps;

export function useToolbar(
  options: ToolbarOptions,
  htmlProps: ToolbarProps = {}
) {
  options = unstable_useOptions("useToolbar", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "toolbar",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useToolbar", options, htmlProps);
  return htmlProps;
}

const keys: Keys<ToolbarStateReturn & ToolbarOptions> = [
  ...useBox.__keys,
  ...useToolbarState.__keys
];

useToolbar.__keys = keys;

export const Toolbar = unstable_createComponent({
  as: "div",
  useHook: useToolbar,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-21`,
      "Toolbar"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
