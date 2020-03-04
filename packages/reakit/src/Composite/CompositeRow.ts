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

export type unstable_CompositeRowOptions = GroupOptions &
  unstable_IdOptions &
  Pick<unstable_CompositeStateReturn, "registerRow" | "unregisterRow">;

export type unstable_CompositeRowHTMLProps = GroupHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeRowProps = unstable_CompositeRowOptions &
  unstable_CompositeRowHTMLProps;

export const unstable_useCompositeRow = createHook<
  unstable_CompositeRowOptions,
  unstable_CompositeRowHTMLProps
>({
  name: "CompositeRow",
  compose: [useGroup, unstable_useId],
  useState: unstable_useCompositeState,

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const id = options.id || htmlProps.id;

    // We need this to be called before CompositeItems' register
    useIsomorphicEffect(() => {
      if (!id) return undefined;
      options.registerRow?.({ id, ref });
      return () => {
        options.unregisterRow?.(id);
      };
    }, [id, options.registerRow, options.unregisterRow]);

    return {
      ref: useForkRef(ref, htmlRef),
      ...htmlProps
    };
  }
});

export const unstable_CompositeRow = createComponent({
  as: "div",
  useHook: unstable_useCompositeRow
});
