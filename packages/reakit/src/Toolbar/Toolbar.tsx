import { warning } from "../__utils/warning";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type ToolbarOptions = BoxOptions &
  Pick<Partial<ToolbarStateReturn>, "orientation">;

export type ToolbarHTMLProps = BoxHTMLProps;

export type ToolbarProps = ToolbarOptions & ToolbarHTMLProps;

export const useToolbar = unstable_createHook<ToolbarOptions, ToolbarHTMLProps>(
  {
    name: "Toolbar",
    compose: useBox,
    useState: useToolbarState,

    useProps(options, htmlProps) {
      return unstable_mergeProps(
        {
          role: "toolbar",
          "aria-orientation": options.orientation
        } as ToolbarHTMLProps,
        htmlProps
      );
    }
  }
);

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
