import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { GroupOptions, GroupHTMLProps, useGroup } from "../Group/Group";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeGroupOptions = GroupOptions &
  unstable_IdOptions &
  Pick<unstable_CompositeStateReturn, "registerGroup" | "unregisterGroup">;

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

    return {
      ref: useForkRef(ref, htmlRef),
      ...htmlProps
    };
  }
});

export const unstable_CompositeGroup = createComponent({
  as: "div",
  useHook: unstable_useCompositeGroup
});
