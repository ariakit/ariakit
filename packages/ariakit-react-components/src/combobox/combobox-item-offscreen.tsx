import {
  useMergeRefs,
  useSafeLayoutEffect,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { disabledFromProps } from "@ariakit/utils";
import type { ElementType } from "react";
import { useContext, useRef } from "react";
import type { CompositeItemOptions } from "../composite/composite-item-offscreen.tsx";
import { useCompositeItemOffscreen } from "../composite/composite-item-offscreen.tsx";
import {
  getRenderElementTagName,
  hasCustomElementRender,
  hasRenderElementProp,
  supportsDisabledAttribute,
} from "../composite/utils.ts";
import { Role } from "../role/role.tsx";
import {
  ComboboxListRoleContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import * as Base from "./combobox-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type DisabledElement = HTMLElement & { disabled: boolean };

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
  const tagNameRef = useRef<HTMLElement>(null);
  const renderTagName = getRenderElementTagName(props.render);
  const hasCustomRender =
    typeof props.render === "function" || hasCustomElementRender(props.render);
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  const offscreenRef = useMergeRefs(ref, tagNameRef, props.ref);
  const trulyDisabled =
    props.focusable !== false &&
    disabledFromProps(allProps) &&
    !props.accessibleWhenDisabled;
  useSafeLayoutEffect(() => {
    if (active) return;
    if (!hasCustomRender) return;
    if (hasRenderElementProp(props.render, "disabled")) return;
    const element = tagNameRef.current;
    if (!element) return;
    const tagName = element.tagName.toLowerCase();
    if (!supportsDisabledAttribute(tagName)) {
      element.removeAttribute("disabled");
      return;
    }
    (element as unknown as DisabledElement).disabled = trulyDisabled;
  });
  if (active) {
    return <Base.ComboboxItem {...allProps} />;
  }
  const offscreenProps = { ...allProps, ref: offscreenRef };
  // Remove ComboboxItem props
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
    render,
    ...htmlProps
  } = offscreenProps;
  const disabledProps =
    trulyDisabled && supportsDisabledAttribute(renderTagName)
      ? { disabled: true }
      : {};
  const Component = Role[TagName];
  return <Component {...htmlProps} {...disabledProps} render={render} />;
});

export interface ComboboxItemOptions<T extends ElementType = TagName>
  extends Base.ComboboxItemOptions<T>, Omit<CompositeItemOptions<T>, "store"> {}

export type ComboboxItemProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxItemOptions<T>
>;
