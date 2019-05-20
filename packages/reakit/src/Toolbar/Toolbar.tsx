import { warning } from "../__utils/warning";
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
      return {
        role: "toolbar",
        "aria-orientation": options.orientation,
        ...htmlProps
      };
    }
  }
);

export const Toolbar = unstable_createComponent({
  as: "div",
  useHook: useToolbar,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props. See https://reakit.io/docs/toolbar",
      "Toolbar"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
