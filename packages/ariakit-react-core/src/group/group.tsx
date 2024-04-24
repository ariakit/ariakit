import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useState } from "react";
import type { ElementType } from "react";
import { useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { GroupLabelContext } from "./group-label-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `Group` component.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * const props = useGroup();
 * <Role {...props}>Group</Role>
 * ```
 */
export const useGroup = createHook<TagName, GroupOptions>(
  function useGroup(props) {
    const [labelId, setLabelId] = useState<string>();

    props = useWrapElement(
      props,
      (element) => (
        <GroupLabelContext.Provider value={setLabelId}>
          {element}
        </GroupLabelContext.Provider>
      ),
      [],
    );

    props = {
      role: "group",
      "aria-labelledby": labelId,
      ...props,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a group element. Optionally, a
 * [`GroupLabel`](https://ariakit.org/reference/group-label) can be rendered as
 * a child to provide a label for the group.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export const Group = forwardRef(function Group(props: GroupProps) {
  const htmlProps = useGroup(props);
  return createElement(TagName, htmlProps);
});

export type GroupOptions<_T extends ElementType = TagName> = Options;

export type GroupProps<T extends ElementType = TagName> = Props<
  T,
  GroupOptions<T>
>;
