import { useContext } from "react";
import type { ElementType } from "react";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useId, useSafeLayoutEffect } from "../utils/hooks.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { As, Options2, Props2 } from "../utils/types.js";
import { GroupLabelContext } from "./group-label-context.js";

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
export const useGroupLabel = createHook2<TagName, GroupLabelOptions>(
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
export const GroupLabel = forwardRef(function GroupLabel(props) {
  const htmlProps = useGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export type GroupLabelOptions<_T extends As = TagName> = Options2;

export type GroupLabelProps<T extends As = TagName> = Props2<
  T,
  GroupLabelOptions<T>
>;
