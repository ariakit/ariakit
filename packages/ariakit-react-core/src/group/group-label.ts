import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Options, Props } from "../utils/types";
import { GroupLabelContext } from "./group-label-context";

/**
 * Returns props to create a `GroupLabel` component. This hook must be used in a
 * component that's wrapped with `Group` so the `aria-labelledby` prop is
 * properly set on the group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * // This component must be wrapped with Group
 * const props = useGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useGroupLabel = createHook<GroupLabelOptions>((props) => {
  const setLabelId = useContext(GroupLabelContext);
  const id = useId(props.id);

  useSafeLayoutEffect(() => {
    setLabelId?.(id);
    return () => setLabelId?.(undefined);
  }, [setLabelId, id]);

  props = {
    id,
    "aria-hidden": true,
    ...props,
  };
  return props;
});

/**
 * Renders a label in a group. This component must be wrapped with `Group` so
 * the `aria-labelledby` prop is properly set on the group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>
 *   <GroupLabel>Label</GroupLabel>
 * </Group>
 * ```
 */
export const GroupLabel = createComponent<GroupLabelOptions>((props) => {
  const htmlProps = useGroupLabel(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  GroupLabel.displayName = "GroupLabel";
}

export type GroupLabelOptions<T extends As = "div"> = Options<T>;

export type GroupLabelProps<T extends As = "div"> = Props<GroupLabelOptions<T>>;
