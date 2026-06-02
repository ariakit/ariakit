import {
  useMergeRefs,
  useSafeLayoutEffect,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { disabledFromProps } from "@ariakit/utils";
import type { ElementType } from "react";
import { useRef } from "react";
import type { CompositeItemOptions } from "../composite/composite-item-offscreen.tsx";
import { useCompositeItemOffscreen } from "../composite/composite-item-offscreen.tsx";
import {
  getRenderElementTagName,
  hasCustomElementRender,
  hasRenderElementProp,
  supportsDisabledAttribute,
} from "../composite/utils.ts";
import { Role } from "../role/role.tsx";
import { useSelectScopedContext } from "./select-context.tsx";
import * as Base from "./select-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type DisabledElement = HTMLElement & { disabled: boolean };

export function useSelectItemOffscreen<
  T extends ElementType,
  // oxlint-disable-next-line no-unnecessary-type-parameters
  P extends SelectItemProps<T>,
>({ store, value, ...props }: P) {
  const context = useSelectScopedContext();
  store = store || context;
  return useCompositeItemOffscreen({ store, value, ...props });
}

export const SelectItem = forwardRef(function SelectItem({
  offscreenMode,
  offscreenRoot,
  ...props
}: SelectItemProps) {
  const { active, ref, ...rest } = useSelectItemOffscreen({
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
    return <Base.SelectItem {...allProps} />;
  }
  const offscreenProps = { ...allProps, ref: offscreenRef };
  // Remove SelectItem props
  const {
    store,
    value,
    disabled,
    shouldRegisterItem,
    rowId,
    getItem,
    hideOnClick,
    setValueOnClick,
    preventScrollOnKeyDown,
    moveOnKeyPress,
    tabbable,
    clickOnEnter,
    clickOnSpace,
    focusable,
    accessibleWhenDisabled,
    autoFocus,
    onFocusVisible,
    focusOnHover,
    blurOnHoverEnd,
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

export interface SelectItemOptions<T extends ElementType = TagName>
  extends Base.SelectItemOptions<T>, Omit<CompositeItemOptions<T>, "store"> {}

export type SelectItemProps<T extends ElementType = TagName> = Props<
  T,
  SelectItemOptions<T>
>;
