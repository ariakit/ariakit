import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabListOptions = unstable_BoxOptions &
  Partial<unstable_TabStateReturn>;

export type unstable_TabListProps = unstable_BoxProps;

export function useTabList(
  options: unstable_TabListOptions,
  htmlProps: unstable_TabListProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "tablist",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useTabList", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabListOptions> = [
  ...useBox.keys,
  ...useTabState.keys
];

useTabList.keys = keys;

export const TabList = unstable_createComponent(
  "div",
  useTabList,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-20`,
      "TabList"
    );

    const element = unstable_useCreateElement(type, props, children);
    return element;
  }
);
