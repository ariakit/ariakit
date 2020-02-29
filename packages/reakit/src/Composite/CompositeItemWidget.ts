import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { GroupOptions, GroupHTMLProps, useGroup } from "../Group/Group";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeItemWidgetOptions = GroupOptions &
  unstable_IdOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "orientation" | "unstable_moves"
  >;

export type unstable_CompositeItemWidgetHTMLProps = GroupHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeItemWidgetProps = unstable_CompositeItemWidgetOptions &
  unstable_CompositeItemWidgetHTMLProps;

export const unstable_useCompositeItemWidget = createHook<
  unstable_CompositeItemWidgetOptions,
  unstable_CompositeItemWidgetHTMLProps
>({
  name: "CompositeItemWidget",
  compose: [useGroup, unstable_useId],
  useState: unstable_useCompositeState
});

export const unstable_CompositeItemWidget = createComponent({
  as: "div",
  useHook: unstable_useCompositeItemWidget
});
