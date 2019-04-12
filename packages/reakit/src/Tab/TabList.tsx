import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { Keys } from "../__utils/types";
import { useTabState, TabStateReturn } from "./TabState";

export type TabListOptions = BoxOptions &
  Pick<Partial<TabStateReturn>, "orientation">;

export type TabListProps = BoxProps;

export function useTabList(
  options: TabListOptions,
  htmlProps: TabListProps = {}
) {
  options = unstable_useOptions("useTabList", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "tablist",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useTabList", options, htmlProps);
  return htmlProps;
}

const keys: Keys<TabStateReturn & TabListOptions> = [
  ...useBox.__keys,
  ...useTabState.__keys
];

useTabList.__keys = keys;

export const TabList = unstable_createComponent({
  as: "div",
  useHook: useTabList,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-20`,
      "TabList"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
