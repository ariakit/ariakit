import type { ValidComponent } from "solid-js";
import { createSignal } from "solid-js";
import { As } from "../as/as.tsx";
import { mergeProps } from "../utils/reactivity.ts";
import { createHook, createInstance, wrapInstance } from "../utils/system.tsx";
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
      <As component={GroupLabelContext.Provider} value={setLabelId} />,
    );

    props = mergeProps(
      {
        role: "group" as const,
        get "aria-labelledby"() {
          return labelId();
        },
      },
      props,
    );

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
