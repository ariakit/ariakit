import { warning } from "../__utils/warning";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_createHook } from "../utils/createHook";
import { useTabState, TabStateReturn } from "./TabState";

export type TabListOptions = BoxOptions &
  Pick<Partial<TabStateReturn>, "orientation">;

export type TabListHTMLProps = BoxHTMLProps;

export type TabListProps = TabListOptions & TabListHTMLProps;

export const useTabList = unstable_createHook<TabListOptions, TabListHTMLProps>(
  {
    name: "TabList",
    compose: useBox,
    useState: useTabState,

    useProps(options, htmlProps) {
      return {
        role: "tablist",
        "aria-orientation": options.orientation,
        ...htmlProps
      };
    }
  }
);

export const TabList = unstable_createComponent({
  as: "div",
  useHook: useTabList,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "TabList",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/tab"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
