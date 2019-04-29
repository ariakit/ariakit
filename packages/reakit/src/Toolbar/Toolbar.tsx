import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type ToolbarOptions = BoxOptions &
  Pick<Partial<ToolbarStateReturn>, "orientation">;

export type ToolbarProps = BoxProps;

export const useToolbar = unstable_createHook<ToolbarOptions, ToolbarProps>({
  name: "Toolbar",
  compose: useBox,
  useState: useToolbarState,

  useProps(options, htmlProps) {
    return mergeProps(
      {
        role: "toolbar",
        "aria-orientation": options.orientation
      } as ToolbarProps,
      htmlProps
    );
  }
});

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
