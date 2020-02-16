import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  unstable_useIdGroup,
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps
} from "../Id/IdGroup";
import { useTabbable, TabbableOptions, TabbableHTMLProps } from "../Tabbable";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeOptions = TabbableOptions &
  unstable_IdGroupOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "orientation" | "unstable_moves"
  > &
  Pick<
    unstable_CompositeStateReturn,
    | "activeDescendant"
    | "compositeRef"
    | "stops"
    | "currentId"
    | "registerStop"
    | "unregisterStop"
    | "setCurrentId"
    | "next"
    | "previous"
    | "rows"
    | "up"
    | "down"
    | "first"
    | "last"
  >;

export type unstable_CompositeHTMLProps = TabbableHTMLProps &
  unstable_IdGroupHTMLProps;

export type unstable_CompositeProps = unstable_CompositeOptions &
  unstable_CompositeHTMLProps;

function getCurrentStop({ stops, currentId }: unstable_CompositeOptions) {
  if (!stops) return undefined;
  return (
    stops.find(stop => stop.id === currentId) ||
    stops.find(stop => !stop.disabled)
  );
}

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  compose: [unstable_useIdGroup, useTabbable],
  useState: unstable_useCompositeState,

  useProps(options, { onKeyDown: htmlOnKeyDown, ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const currentStop = getCurrentStop(options);

    React.useEffect(() => {
      if (options.compositeRef) {
        options.compositeRef.current = ref.current || undefined;
      }
    }, [options.compositeRef]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.target !== event.currentTarget) return;
        if (currentStop?.ref.current) {
          if (event.key !== "Tab") {
            event.preventDefault();
            currentStop.ref.current.dispatchEvent(
              new KeyboardEvent("keydown", event)
            );
          }
        }
      },
      [currentStop]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      "aria-activedescendant": options.activeDescendant ? currentStop?.id : "",
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    // @ts-ignore Passing true as the last argument so it doesn't call
    // useIdGroup.useOptions, which was already called before.
    htmlProps = unstable_useIdGroup(options, htmlProps, true);
    // @ts-ignore
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.activeDescendant) {
      return tabbableHTMLProps;
    }
    return htmlProps;
  }
});

export const unstable_Composite = createComponent({
  as: "div",
  useHook: unstable_useComposite
});
