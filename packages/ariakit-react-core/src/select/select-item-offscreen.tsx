import type { ElementType } from "react";
import type { CompositeItemOptions } from "../composite/composite-item-offscreen.tsx";
import { useCompositeItemOffscreen } from "../composite/composite-item-offscreen.tsx";
import { Role } from "../role/role.tsx";
import { useMergeRefs } from "../utils/hooks.ts";
import { forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useSelectScopedContext } from "./select-context.tsx";
import * as Base from "./select-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

export function useSelectItemOffscreen<
  T extends ElementType,
  P extends SelectItemProps<T>,
>({ store, value, ...props }: P) {
  const context = useSelectScopedContext();
  store = store || context;
  return useCompositeItemOffscreen({ store, value, ...props });
}

export const SelectItem = forwardRef(function SelectItem({
  offscreenBehavior,
  offscreenRoot,
  ...props
}: SelectItemProps) {
  const { active, ref, ...rest } = useSelectItemOffscreen({
    offscreenBehavior,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.SelectItem {...allProps} />;
  }
  // Remove SelectItem props
  const {
    store,
    value,
    getItem,
    hideOnClick,
    setValueOnClick,
    preventScrollOnKeyDown,
    focusOnHover,
    blurOnHoverEnd,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface SelectItemOptions<T extends ElementType = TagName>
  extends Base.SelectItemOptions<T>,
    Omit<CompositeItemOptions<T>, "store"> {}

export type SelectItemProps<T extends ElementType = TagName> = Props<
  T,
  SelectItemOptions<T>
>;
