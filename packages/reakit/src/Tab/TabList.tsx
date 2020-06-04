import { useWarning } from "reakit-warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import {
  CompositeOptions,
  CompositeHTMLProps,
  useComposite,
} from "../Composite/Composite";
import { useTabState, TabStateReturn } from "./TabState";

export type TabListOptions = CompositeOptions &
  Pick<Partial<TabStateReturn>, "orientation">;

export type TabListHTMLProps = CompositeHTMLProps;

export type TabListProps = TabListOptions & TabListHTMLProps;

export const useTabList = createHook<TabListOptions, TabListHTMLProps>({
  name: "TabList",
  compose: useComposite,
  useState: useTabState,

  useProps(options, htmlProps) {
    return {
      role: "tablist",
      "aria-orientation": options.orientation,
      ...htmlProps,
    };
  },
});

export const TabList = createComponent({
  as: "div",
  useHook: useTabList,
  useCreateElement: (type, props, children) => {
    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/tab"
    );
    return useCreateElement(type, props, children);
  },
});
