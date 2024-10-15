import type { ElementType } from "react";
import {
  type CollectionItemOptions,
  useCollectionItemOffscreen,
} from "../collection/collection-item-offscreen.tsx";
import { Role } from "../role/role.tsx";
import { useMergeRefs } from "../utils/hooks.ts";
import { forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import * as Base from "./composite-item.tsx";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

export function useCompositeItemOffscreen<
  T extends ElementType,
  P extends CompositeItemProps<T>,
>(props: P) {
  return useCollectionItemOffscreen(props);
}

export const CompositeItem = forwardRef(function CompositeItem(
  props: CompositeItemProps,
) {
  const { active, ref, ...rest } = useCollectionItemOffscreen(props);
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
