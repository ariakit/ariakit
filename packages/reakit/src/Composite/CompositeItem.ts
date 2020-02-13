import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeItemOptions = TabbableOptions &
  unstable_IdOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "orientation" | "unstable_moves"
  > &
  Pick<
    unstable_CompositeStateReturn,
    | "stops"
    | "currentId"
    | "registerStop"
    | "unregisterStop"
    | "setCurrentId"
    | "next"
    | "previous"
    | "up"
    | "down"
    | "first"
    | "last"
  > & {
    /**
     * Element ID.
     */
    stopId?: string;
  };

export type unstable_CompositeItemHTMLProps = TabbableHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeItemProps = unstable_CompositeItemOptions &
  unstable_CompositeItemHTMLProps;

export const unstable_useCompositeItem = createHook<
  unstable_CompositeItemOptions,
  unstable_CompositeItemHTMLProps
>({
  name: "CompositeItem",
  compose: [useTabbable, unstable_useId],
  useState: unstable_useCompositeState,
  keys: ["stopId"],

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
    const ref = React.useRef<HTMLElement>(null);
    const stopId = options.stopId || options.id || htmlProps.id;

    const trulyDisabled = options.disabled && !options.focusable;
    const noFocused = options.currentId == null;
    const focused = options.currentId === stopId;
    const stop = (options.stops || []).find(s => s.id === stopId);
    const isFirst = (options.stops || [])[0] && options.stops[0].id === stopId;
    const shouldTabIndex = focused || (isFirst && noFocused);

    React.useEffect(() => {
      if (!stopId) return undefined;
      if (options.registerStop) {
        options.registerStop({ id: stopId, ref, disabled: trulyDisabled });
      }
      return () => {
        if (options.unregisterStop) {
          options.unregisterStop(stopId);
        }
      };
    }, [stopId, trulyDisabled, options.registerStop, options.unregisterStop]);

    React.useEffect(() => {
      const rover = ref.current;
      if (!rover) {
        warning(
          true,
          "[reakit/CompositeItem]",
          "Can't focus rover component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/rover"
        );
        return;
      }
      if (options.unstable_moves && focused && !hasFocusWithin(rover)) {
        rover.focus();
      }
    }, [focused, options.unstable_moves]);

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (!stopId || !event.currentTarget.contains(event.target)) return;
        // this is already focused, so we move silently
        options.setCurrentId(stopId);
      },
      [options.setCurrentId, stopId]
    );

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          shouldKeyDown: event =>
            // Ignore portals
            // https://github.com/facebook/react/issues/11387
            event.currentTarget.contains(event.target as Node),
          keyMap: {
            ArrowUp: () => {
              if (stop?.rowId) {
                options.up && options.up();
              } else if (options.orientation !== "horizontal") {
                options.previous && options.previous();
              }
            },
            ArrowRight:
              options.orientation !== "vertical" && (() => options.next()),
            ArrowDown: () => {
              if (stop?.rowId) {
                options.down && options.down();
              } else if (options.orientation !== "vertical") {
                options.next && options.next();
              }
            },
            ArrowLeft:
              options.orientation !== "vertical" && (() => options.previous()),
            Home: event => {
              if (stop?.rowId) {
                if (event.ctrlKey) {
                  options.first && options.first();
                } else {
                  options.previous && options.previous(true);
                }
              } else {
                options.first && options.first();
              }
            },
            End: event => {
              if (stop?.rowId) {
                if (event.ctrlKey) {
                  options.last && options.last();
                } else {
                  options.next && options.next(true);
                }
              } else {
                options.last && options.last();
              }
            },
            PageUp: () => {
              if (stop?.rowId) {
                options.up && options.up(true);
              } else {
                options.first && options.first();
              }
            },
            PageDown: () => {
              if (stop?.rowId) {
                options.down && options.down(true);
              } else {
                options.last && options.last();
              }
            }
          }
        }),
      [
        htmlOnKeyDown,
        stop,
        options.orientation,
        options.previous,
        options.next,
        options.first,
        options.last
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id: stopId,
      tabIndex: shouldTabIndex ? htmlTabIndex : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onKeyDown,
      ...htmlProps
    };
  }
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem
});
