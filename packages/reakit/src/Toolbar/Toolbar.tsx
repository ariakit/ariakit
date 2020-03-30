import { useWarning } from "reakit-warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import {
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps,
  unstable_useComposite
} from "../Composite/Composite";
import { ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type ToolbarOptions = unstable_CompositeOptions &
  Pick<Partial<ToolbarStateReturn>, "orientation">;

export type ToolbarHTMLProps = unstable_CompositeHTMLProps;

export type ToolbarProps = ToolbarOptions & ToolbarHTMLProps;

export const useToolbar = createHook<ToolbarOptions, ToolbarHTMLProps>({
  name: "Toolbar",
  compose: unstable_useComposite,
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
    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/toolbar"
    );
    return useCreateElement(type, props, children);
  }
});
