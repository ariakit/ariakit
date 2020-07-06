import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  CompositeGroupOptions,
  CompositeGroupHTMLProps,
  useCompositeGroup,
} from "../Composite/CompositeGroup";
import { unstable_useGridState as useGridState } from "./GridState";

export type unstable_GridRowOptions = CompositeGroupOptions;

export type unstable_GridRowHTMLProps = CompositeGroupHTMLProps;

export type unstable_GridRowProps = unstable_GridRowOptions &
  unstable_GridRowHTMLProps;

export const unstable_useGridRow = createHook<
  unstable_GridRowOptions,
  unstable_GridRowHTMLProps
>({
  name: "GridRow",
  compose: useCompositeGroup,
  useState: useGridState,

  useProps(_, htmlProps) {
    return { role: "row", ...htmlProps };
  },
});

export const unstable_GridRow = createComponent({
  as: "div",
  useHook: unstable_useGridRow,
});
