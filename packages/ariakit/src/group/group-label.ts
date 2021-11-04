import { useContext } from "react";
import { useId, useSafeLayoutEffect } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { GroupLabelContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a group. This hook must be used in a
 * component that's wrapped with `Group` so the `aria-labelledby` prop is
 * properly set on the group element.
 * @see https://ariakit.org/docs/group
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
 * A component that renders a label in a group. This component must be wrapped
 * with `Group` so the `aria-labelledby` prop is properly set on the group
 * element.
 * @see https://ariakit.org/docs/group
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

export type GroupLabelOptions<T extends As = "div"> = Options<T>;

export type GroupLabelProps<T extends As = "div"> = Props<GroupLabelOptions<T>>;
