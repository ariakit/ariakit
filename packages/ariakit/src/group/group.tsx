import { useState } from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { useWrapElement } from "ariakit-utils/hooks";
import { GroupLabelContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a group element.
 * @see https://ariakit.org/docs/group
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
 * A component that renders a group element.
 * @see https://ariakit.org/docs/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export const Group = createComponent<GroupOptions>((props) => {
  const htmlProps = useGroup(props);
  return createElement("div", htmlProps);
});

export type GroupOptions<T extends As = "div"> = Options<T>;

export type GroupProps<T extends As = "div"> = Props<GroupOptions<T>>;
