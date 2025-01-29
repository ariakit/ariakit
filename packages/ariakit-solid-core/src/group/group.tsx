import { type ValidComponent, createSignal } from "solid-js";
import { wrapInstance } from "../utils/misc.ts";
import { $ } from "../utils/props.ts";
import { createHook, createInstance } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { GroupLabelContext } from "./group-label-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `Group` component.
 * @see https://solid.ariakit.org/components/group
 * @example
 * ```jsx
 * const props = useGroup();
 * <Role {...props}>Group</Role>
 * ```
 */
export const useGroup = createHook<TagName, GroupOptions>(
  function useGroup(props) {
    const [labelId, setLabelId] = createSignal<string>();

    props = wrapInstance(
      props,
      (wrapperProps) => (
        <GroupLabelContext.Provider value={setLabelId}>
          {wrapperProps.children}
        </GroupLabelContext.Provider>
      ),
      [],
    );

    $(props, {
      // [port]: Solid type for `role` is more strict, hence the `as const`.
      role: "group" as const,
      "$aria-labelledby": labelId,
    });

    return props;
  },
);

/**
 * Renders a group element. Optionally, a
 * [`GroupLabel`](https://solid.ariakit.org/reference/group-label) can be rendered as
 * a child to provide a label for the group.
 * @see https://solid.ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export const Group = function Group(props: GroupProps) {
  const htmlProps = useGroup(props);
  return createInstance(TagName, htmlProps);
};

export type GroupOptions<_T extends ValidComponent = TagName> = Options;

export type GroupProps<T extends ValidComponent = TagName> = Props<
  T,
  GroupOptions<T>
>;
