import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { getActiveElement } from "reakit-utils/getActiveElement";
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
    | "unstable_focusStrategy"
    | "compositeRef"
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
      onMouseDown: htmlOnMouseDown,
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

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (!stopId || !event.currentTarget.contains(event.target)) return;
        // this is already focused, so we move silently
        options.setCurrentId(stopId);
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          // event.currentTarget.scrollIntoViewIfNeeded();
          if (
            getActiveElement(event.currentTarget) !==
            options.compositeRef.current
          ) {
            options.compositeRef.current?.focus();
          }
        }
      },
      [
        options.setCurrentId,
        stopId,
        options.unstable_focusStrategy,
        options.compositeRef
      ]
    );

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "[reakit/CompositeItem]",
          "Can't focus composite item component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/composite"
        );
        return;
      }
      if (options.unstable_moves && focused && !hasFocusWithin(self)) {
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          onFocus({ currentTarget: ref.current, target: ref.current });
        } else {
          self.focus();
        }
      }
    }, [
      onFocus,
      stopId,
      focused,
      options.unstable_moves,
      options.unstable_focusStrategy
    ]);

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          event.preventDefault();
          onFocus({ currentTarget: ref.current, target: ref.current });
        }
      },
      [onFocus, options.unstable_focusStrategy]
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
            ArrowRight: () => {
              if (options.orientation !== "vertical") {
                options.next && options.next();
              }
            },
            ArrowDown: () => {
              if (stop?.rowId) {
                options.down && options.down();
              } else if (options.orientation !== "horizontal") {
                options.next && options.next();
              }
            },
            ArrowLeft: () => {
              if (options.orientation !== "vertical") {
                options.previous && options.previous();
              }
            },
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
      "aria-selected":
        options.unstable_focusStrategy === "aria-activedescendant" && focused
          ? true
          : undefined,
      tabIndex:
        options.unstable_focusStrategy !== "aria-activedescendant" &&
        shouldTabIndex
          ? htmlTabIndex
          : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onMouseDown: useAllCallbacks(onMouseDown, htmlOnMouseDown),
      onKeyDown,
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    // @ts-ignore
    htmlProps = unstable_useId(options, htmlProps, true);
    // @ts-ignore
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.unstable_focusStrategy === "aria-activedescendant") {
      return { ...tabbableHTMLProps, onMouseDown: htmlProps.onMouseDown };
    }
    return tabbableHTMLProps;
  }
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem
});
