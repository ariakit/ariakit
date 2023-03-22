import { useState } from "react";
import { useWrapElement } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Options, Props } from "../utils/types.js";
import { GroupLabelContext } from "./group-label-context.js";

/**
 * Returns props to create a `Group` component.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * const props = useGroup();
 * <Role {...props}>Group</Role>
 * ```
 */
export const useGroup = createHook<GroupOptions>((props) => {
  const [labelId, setLabelId] = useState<string>();

  props = useWrapElement(
    props,
    (element) => (
      <GroupLabelContext.Provider value={setLabelId}>
        {element}
      </GroupLabelContext.Provider>
    ),
    []
  );

  props = {
    role: "group",
    "aria-labelledby": labelId,
    ...props,
  };

  return props;
});

/**
 * Renders a group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export const Group = createComponent<GroupOptions>((props) => {
  const htmlProps = useGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Group.displayName = "Group";
}

export type GroupOptions<T extends As = "div"> = Options<T>;

export type GroupProps<T extends As = "div"> = Props<GroupOptions<T>>;
