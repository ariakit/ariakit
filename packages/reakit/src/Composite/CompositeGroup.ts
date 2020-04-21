import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { GroupOptions, GroupHTMLProps, useGroup } from "../Group/Group";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps,
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState,
} from "./CompositeState";
import { findEnabledItemById } from "./__utils/findEnabledItemById";

export type unstable_CompositeGroupOptions = GroupOptions &
  unstable_IdOptions &
  Pick<unstable_CompositeStateReturn, "registerGroup" | "unregisterGroup"> &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "currentId" | "unstable_moves" | "items"
  >;

export type unstable_CompositeGroupHTMLProps = GroupHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeGroupProps = unstable_CompositeGroupOptions &
  unstable_CompositeGroupHTMLProps;

export const unstable_useCompositeGroup = createHook<
  unstable_CompositeGroupOptions,
  unstable_CompositeGroupHTMLProps
>({
  name: "CompositeGroup",
  compose: [useGroup, unstable_useId],
  useState: unstable_useCompositeState,

  propsAreEqual(prev, next) {
    if (!next.id || prev.id !== next.id) {
      return useGroup.unstable_propsAreEqual(prev, next);
    }
    const {
      currentId: prevCurrentId,
      unstable_moves: prevMoves,
      ...prevProps
    } = prev;
    const {
      currentId: nextCurrentId,
      unstable_moves: nextMoves,
      ...nextProps
    } = next;
    if (prev.items && next.items) {
      const prevCurrentItem = findEnabledItemById(prev.items, prevCurrentId);
      const nextCurrentItem = findEnabledItemById(next.items, nextCurrentId);
      const prevGroupId = prevCurrentItem?.groupId;
      const nextGroupId = nextCurrentItem?.groupId;
      if (next.id === nextGroupId || next.id === prevGroupId) {
        return false;
      }
    }
    return useGroup.unstable_propsAreEqual(prevProps, nextProps);
  },

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const { id } = options;

    // We need this to be called before CompositeItems' register
    useIsomorphicEffect(() => {
      if (!id) return undefined;
      options.registerGroup?.({ id, ref });
      return () => {
        options.unregisterGroup?.(id);
      };
    }, [id, options.registerGroup, options.unregisterGroup]);

    return { ref: useForkRef(ref, htmlRef), ...htmlProps };
  },
});

export const unstable_CompositeGroup = createComponent({
  as: "div",
  useHook: unstable_useCompositeGroup,
});
