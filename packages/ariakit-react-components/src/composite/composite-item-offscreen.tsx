import { useStoreStateObject } from "@ariakit/react-store";
import { useId, useMergeRefs, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { disabledFromProps, getPopupItemRole } from "@ariakit/utils";
import type { ElementType } from "react";
import type { CollectionItemOptions } from "../collection/collection-item-offscreen.tsx";
import { useCollectionItemOffscreen } from "../collection/collection-item-offscreen.tsx";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import { Role } from "../role/role.tsx";
import type { SelectStore } from "../select/select-store.ts";
import { useCompositeScopedContext } from "./composite-context.tsx";
import * as Base from "./composite-item.tsx";
import type { CompositeStore } from "./composite-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

export function useCompositeItemOffscreen<
  T extends ElementType,
  // oxlint-disable-next-line no-unnecessary-type-parameters
  P extends CompositeItemProps<T>,
>({
  store,
  offscreenMode = "active",
  disabled: disabledProp,
  value,
  ...props
}: P) {
  const context = useCompositeScopedContext();
  store = store || context;

  const id = useId(props.id);
  // The public prop uses the base CompositeStore type, but this component is
  // also rendered by Combobox and Select stores with additional state keys.
  // oxlint-disable-next-line no-unnecessary-type-assertion
  const stateStore = store as
    | CompositeStore
    | ComboboxStore
    | SelectStore
    | undefined;

  const { storeId, active, listElement, offscreenRoot } = useStoreStateObject(
    stateStore,
    ["value", "activeId", "listElement", "contentElement"],
    {
      storeId: "id",
      active(state) {
        if (!state) return;
        if (!("selectedValue" in state) && "value" in state) {
          if (state.value === value) return true;
        }
        return !!id && state.activeId === id;
      },
      listElement(state) {
        if (!state) return;
        if (!("listElement" in state)) return;
        return state.listElement;
      },
      offscreenRoot(state) {
        if (props.offscreenRoot) return props.offscreenRoot;
        if (!state) return;
        if (!("contentElement" in state)) return;
        return state.contentElement || null;
      },
    },
  );

  const offscreenProps = useCollectionItemOffscreen({
    id,
    store,
    offscreenMode: active ? "active" : offscreenMode,
    ...props,
    offscreenRoot,
  });

  if (!offscreenProps.active) {
    const disabled = disabledFromProps({ disabled: disabledProp, ...props });
    const trulyDisabled = disabled && !props.accessibleWhenDisabled;
    return {
      ...offscreenProps,
      children: value,
      role: getPopupItemRole(listElement),
      "aria-disabled": disabled || undefined,
      "data-disabled": trulyDisabled || undefined,
      "data-offscreen-id": storeId,
    };
  }

  return offscreenProps;
}

export const CompositeItem = forwardRef(function CompositeItem({
  offscreenMode,
  offscreenRoot,
  ...props
}: CompositeItemProps) {
  const { active, ref, ...rest } = useCompositeItemOffscreen({
    offscreenMode,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.CompositeItem {...allProps} />;
  }
  // Remove CompositeItem props. Custom renders own their native disabled state.
  const {
    store,
    disabled,
    shouldRegisterItem,
    rowId,
    preventScrollOnKeyDown,
    moveOnKeyPress,
    tabbable,
    clickOnEnter,
    clickOnSpace,
    focusable,
    accessibleWhenDisabled,
    autoFocus,
    onFocusVisible,
    getItem,
    // @ts-expect-error This prop may come from a collection renderer.
    element,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface CompositeItemOptions<T extends ElementType = TagName>
  extends
    Base.CompositeItemOptions<T>,
    Omit<CollectionItemOptions<T>, "store"> {}

export type CompositeItemProps<T extends ElementType = TagName> = Props<
  T,
  CompositeItemOptions<T>
>;
