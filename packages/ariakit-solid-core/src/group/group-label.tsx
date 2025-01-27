import {
  type ValidComponent,
  createEffect,
  onCleanup,
  useContext,
} from "solid-js";
import { createId } from "../utils/misc.ts";
import { $ } from "../utils/props.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { GroupLabelContext } from "./group-label-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `GroupLabel` component. This hook must be used in a
 * component that's wrapped with `Group` so the `aria-labelledby` prop is
 * properly set on the group element.
 * @see https://solid.ariakit.org/components/group
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
    const idProp = props.$id;
    const id = () => createId(idProp());

    createEffect(() => {
      setLabelId?.(id());
      onCleanup(() => setLabelId?.(undefined));
    });

    $(props, {
      $id: id,
      "aria-hidden": true,
    });

    return props;
  },
);

/**
 * Renders a label in a group. This component should be wrapped with a
 * [`Group`](https://solid.ariakit.org/reference/group) so the `aria-labelledby`
 * prop is correctly set on the group element.
 * @see https://solid.ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>
 *   <GroupLabel>Label</GroupLabel>
 * </Group>
 * ```
 */
export const GroupLabel = function GroupLabel(props: GroupLabelProps) {
  const htmlProps = useGroupLabel(props);
  return createInstance(TagName, htmlProps);
};

export interface GroupLabelOptions<_T extends ValidComponent = TagName>
  extends Options {}

export type GroupLabelProps<T extends ValidComponent = TagName> = Props<
  T,
  GroupLabelOptions<T>
>;
