import {
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { removeUndefinedValues } from "@ariakit/utils";
import type { ElementType } from "react";
import { useState } from "react";
import { GroupLabelContext } from "./group-label-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `Group` component.
 * @see https://ariakit.com/components/group
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
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      ...props,
    };

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a group element. Optionally, a
 * [`GroupLabel`](https://ariakit.com/reference/group-label) can be rendered as
 * a child to provide a label for the group.
 * @see https://ariakit.com/components/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export const Group = forwardRef(function Group(props: GroupProps) {
  const htmlProps = useGroup(props);
  return createElement(TagName, htmlProps);
});

export interface GroupOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type GroupProps<T extends ElementType = TagName> = Props<
  T,
  GroupOptions<T>
>;
