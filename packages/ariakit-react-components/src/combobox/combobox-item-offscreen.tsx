import { useMergeRefs, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { useContext } from "react";
import type { CompositeItemOptions } from "../composite/composite-item-offscreen.tsx";
import { useCompositeItemOffscreen } from "../composite/composite-item-offscreen.tsx";
import { Role } from "../role/role.tsx";
import {
  ComboboxListRoleContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import * as Base from "./combobox-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

export function useComboboxItemOffscreen<
  T extends ElementType,
  // oxlint-disable-next-line no-unnecessary-type-parameters
  P extends ComboboxItemProps<T>,
>({ store, value, ...props }: P) {
  const context = useComboboxScopedContext();
  store = store || context;

  const offscreenProps = useCompositeItemOffscreen({ store, value, ...props });
  const popupRole = useContext(ComboboxListRoleContext);

  if (!offscreenProps.active) {
    return {
      ...offscreenProps,
      role: Base.getItemRole(popupRole),
    };
  }

  return offscreenProps;
}

export const ComboboxItem = forwardRef(function ComboboxItem({
  offscreenMode,
  offscreenRoot,
  ...props
}: ComboboxItemProps) {
  const { active, ref, ...rest } = useComboboxItemOffscreen({
    offscreenMode,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.ComboboxItem {...allProps} />;
  }
  // Remove ComboboxItem props. Custom renders own their native disabled state.
  const {
    store,
    value,
    disabled,
    shouldRegisterItem,
    rowId,
    hideOnClick,
    setValueOnClick,
    selectValueOnClick,
    resetValueOnSelect,
    preventScrollOnKeyDown,
    focusOnHover,
    blurOnHoverEnd,
    moveOnKeyPress,
    tabbable,
    clickOnEnter,
    clickOnSpace,
    focusable,
    accessibleWhenDisabled,
    autoFocus,
    onFocusVisible,
    getItem,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface ComboboxItemOptions<T extends ElementType = TagName>
  extends Base.ComboboxItemOptions<T>, Omit<CompositeItemOptions<T>, "store"> {}

export type ComboboxItemProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxItemOptions<T>
>;
