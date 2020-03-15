import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem
} from "../Composite/CompositeItem";
import { useToolbarState } from "./ToolbarState";

export type ToolbarItemOptions = CompositeItemOptions;

export type ToolbarItemHTMLProps = CompositeItemHTMLProps;

export type ToolbarItemProps = ToolbarItemOptions & ToolbarItemHTMLProps;

export const useToolbarItem = createHook<
  ToolbarItemOptions,
  ToolbarItemHTMLProps
>({
  name: "ToolbarItem",
  compose: useCompositeItem,
  useState: useToolbarState
});

export const ToolbarItem = createComponent({
  as: "button",
  useHook: useToolbarItem
});
