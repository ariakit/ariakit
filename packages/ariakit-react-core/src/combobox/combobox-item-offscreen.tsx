import type { ElementType } from "react";
import { useContext } from "react";
import type { CompositeItemOptions } from "../composite/composite-item-offscreen.tsx";
import { useCompositeItemOffscreen } from "../composite/composite-item-offscreen.tsx";
import { Role } from "../role/role.tsx";
import { useMergeRefs } from "../utils/hooks.ts";
import { forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  ComboboxListRoleContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import * as Base from "./combobox-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

const itemRoleByPopupRole = {
  menu: "menuitem",
  listbox: "option",
  tree: "treeitem",
};

function getItemRole(popupRole?: string) {
  const key = popupRole as keyof typeof itemRoleByPopupRole;
  return itemRoleByPopupRole[key] ?? "option";
}

export function useComboboxItemOffscreen<
  T extends ElementType,
  P extends ComboboxItemProps<T>,
>({ store, value, ...props }: P) {
  const context = useComboboxScopedContext();
  store = store || context;

  const offscreenProps = useCompositeItemOffscreen({ store, value, ...props });
  const popupRole = useContext(ComboboxListRoleContext);

  if (!offscreenProps.active) {
    return {
      ...offscreenProps,
      role: getItemRole(popupRole),
    };
  }

  return offscreenProps;
}

export const ComboboxItem = forwardRef(function ComboboxItem({
  offscreenBehavior,
  offscreenRoot,
  ...props
}: ComboboxItemProps) {
  const { active, ref, ...rest } = useComboboxItemOffscreen({
    offscreenBehavior,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.ComboboxItem {...allProps} />;
  }
  // Remove ComboboxItem props
  const {
    store,
    value,
    hideOnClick,
    setValueOnClick,
    selectValueOnClick,
    resetValueOnSelect,
    focusOnHover,
    blurOnHoverEnd,
    moveOnKeyPress,
    getItem,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface ComboboxItemOptions<T extends ElementType = TagName>
  extends Base.ComboboxItemOptions<T>,
    Omit<CompositeItemOptions<T>, "store"> {}

export type ComboboxItemProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxItemOptions<T>
>;
