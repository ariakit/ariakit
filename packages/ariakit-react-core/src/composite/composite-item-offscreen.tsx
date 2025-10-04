import { getPopupItemRole } from "@ariakit/core/utils/dom";
import type { ElementType } from "react";
import type { CollectionItemOptions } from "../collection/collection-item-offscreen.tsx";
import { useCollectionItemOffscreen } from "../collection/collection-item-offscreen.tsx";
import type { ComboboxStoreState } from "../combobox/combobox-store.ts";
import { Role } from "../role/role.tsx";
import type { SelectStoreState } from "../select/select-store.ts";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import { useStoreStateObject } from "../utils/store.tsx";
import { forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useCompositeContext } from "./composite-context.tsx";
import * as Base from "./composite-item.tsx";
import type { CompositeStoreState } from "./composite-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

export function useCompositeItemOffscreen<
  T extends ElementType,
  P extends CompositeItemProps<T>,
>({ store, offscreenBehavior = "active", disabled, value, ...props }: P) {
  const context = useCompositeContext();
  store = store || context;

  const id = useId(props.id);

  const { storeId, active, listElement, offscreenRoot } = useStoreStateObject(
    store,
    {
      storeId: "id",
      active(
        state?: CompositeStoreState | ComboboxStoreState | SelectStoreState,
      ) {
        if (!state) return;
        if (!("selectedValue" in state) && "value" in state) {
          if (state.value === value) return true;
        }
        return !!id && state.activeId === id;
      },
      listElement(state?: CompositeStoreState | SelectStoreState) {
        if (!state) return;
        if (!("listElement" in state)) return;
        return state.listElement;
      },
      offscreenRoot(state?: CompositeStoreState | ComboboxStoreState) {
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
    offscreenBehavior: active ? "active" : offscreenBehavior,
    ...props,
    offscreenRoot,
  });

  if (!offscreenProps.active) {
    return {
      ...offscreenProps,
      children: value,
      role: getPopupItemRole(listElement),
      "aria-disabled": disabled || undefined,
      "data-offscreen-id": storeId,
    };
  }

  return offscreenProps;
}

export const CompositeItem = forwardRef(function CompositeItem({
  offscreenBehavior,
  offscreenRoot,
  ...props
}: CompositeItemProps) {
  const { active, ref, ...rest } = useCompositeItemOffscreen({
    offscreenBehavior,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.CompositeItem {...allProps} />;
  }
  // Remove CompositeItem props
  const {
    store,
    rowId,
    preventScrollOnKeyDown,
    moveOnKeyPress,
    tabbable,
    getItem,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface CompositeItemOptions<T extends ElementType = TagName>
  extends Base.CompositeItemOptions<T>,
    Omit<CollectionItemOptions<T>, "store"> {}

export type CompositeItemProps<T extends ElementType = TagName> = Props<
  T,
  CompositeItemOptions<T>
>;
