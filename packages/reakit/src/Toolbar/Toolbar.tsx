import warning from "tiny-warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";
import { unstable_useCreateElement } from "../utils/useCreateElement";

export type unstable_ToolbarOptions = unstable_BoxOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarProps = unstable_BoxProps;

export function useToolbar(
  options: unstable_ToolbarOptions,
  htmlProps: unstable_ToolbarProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "toolbar",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useToolbar", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarOptions> = [
  ...useBox.keys,
  ...useToolbarState.keys
];

useToolbar.keys = keys;

export const Toolbar = unstable_createComponent(
  "div",
  useToolbar,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `[reakit/Toolbar]
You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-21`
    );

    const element = unstable_useCreateElement(type, props, children);
    return element;
  }
);
