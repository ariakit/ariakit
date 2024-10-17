import { type ElementType, useCallback } from "react";
import {
  type CollectionItemOptions,
  useCollectionItemOffscreen,
} from "../collection/collection-item-offscreen.tsx";
import { Role } from "../role/role.tsx";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
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
>({ store, offscreenBehavior = "active", disabled, ...props }: P) {
  const context = useCompositeContext();
  store = store || context;

  const id = useId(props.id);

  const storeId = useStoreState(store, "id");

  // for (let i = 0; i < 50; i++) {
  //   useStoreState(store, "id");
  // }

  const active = useStoreState(
    store,
    useCallback(
      (state?: CompositeStoreState) => !!id && state?.activeId === id,
      [id],
    ),
  );

  const offscreenProps = useCollectionItemOffscreen({
    id,
    store,
    // offscreenBehavior,
    offscreenBehavior: active ? "active" : offscreenBehavior,
    ...props,
  });

  if (!offscreenProps.active) {
    return {
      ...offscreenProps,
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
