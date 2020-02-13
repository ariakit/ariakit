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
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeOptions = unstable_IdGroupOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "orientation" | "unstable_moves"
  > &
  Pick<
    unstable_CompositeStateReturn,
    | "activeDescendant"
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

export type unstable_CompositeHTMLProps = unstable_IdGroupHTMLProps;

export type unstable_CompositeProps = unstable_CompositeOptions &
  unstable_CompositeHTMLProps;

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  // TODO: Compose from Tabbable if it's activeDescendant?
  compose: unstable_useIdGroup,
  useState: unstable_useCompositeState,

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex = 0,
      onFocus: htmlOnFocus,
      onKeyDown: htmlOnKeyDown,
      ...htmlProps
    }
  ) {
    const currentStop =
      (options.stops || []).find(stop => stop.id === options.currentId) ||
      (options.stops || []).find(stop => !stop.disabled);

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
      tabIndex: options.activeDescendant ? 0 : undefined,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      "aria-activedescendant": options.activeDescendant ? currentStop?.id : "",
      ...htmlProps
    };
  }
});

export const unstable_Composite = createComponent({
  as: "div",
  useHook: unstable_useComposite
});
