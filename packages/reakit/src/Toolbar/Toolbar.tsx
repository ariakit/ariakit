import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

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
  htmlProps = useHook("useToolbar", options, htmlProps);
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
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-21`,
      "Toolbar"
    );

    const element = unstable_useCreateElement(type, props, children);
    return element;
  }
);
