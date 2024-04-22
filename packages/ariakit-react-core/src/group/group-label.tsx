import { useContext } from "react";
import type { ElementType } from "react";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useId, useSafeLayoutEffect } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { GroupLabelContext } from "./group-label-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useGroupLabel = createHook<TagName, GroupLabelOptions>(
  function useGroupLabel(props) {
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

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a label in a group. This component should be wrapped with a
 * [`Group`](https://ariakit.org/reference/group) so the `aria-labelledby`
 * prop is correctly set on the group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>
 *   <GroupLabel>Label</GroupLabel>
 * </Group>
 * ```
 */
export const GroupLabel = forwardRef(function GroupLabel(
  props: GroupLabelProps,
) {
  const htmlProps = useGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export interface GroupLabelOptions<_T extends ElementType = TagName>
  extends Options {}

export type GroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  GroupLabelOptions<T>
>;
