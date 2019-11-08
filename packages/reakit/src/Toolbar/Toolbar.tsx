import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { unstable_IdOptions, unstable_IdHTMLProps } from "../Id/Id";
import { unstable_useIdGroup } from "../Id/IdGroup";
import { ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type ToolbarOptions = unstable_IdOptions &
  Pick<Partial<ToolbarStateReturn>, "orientation">;

export type ToolbarHTMLProps = unstable_IdHTMLProps;

export type ToolbarProps = ToolbarOptions & ToolbarHTMLProps;

export const useToolbar = createHook<ToolbarOptions, ToolbarHTMLProps>({
  name: "Toolbar",
  compose: unstable_useIdGroup,
  useState: useToolbarState,

  useProps(options, htmlProps) {
    return {
      role: "toolbar",
      "aria-orientation": options.orientation,
      ...htmlProps
    };
  }
});

export const Toolbar = createComponent({
  as: "div",
  useHook: useToolbar,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "Toolbar",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/toolbar"
    );
    return useCreateElement(type, props, children);
  }
});
