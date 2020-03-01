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
    | "unstable_compositeRef"
    | "items"
    | "currentId"
    | "registerItem"
    | "unregisterItem"
    | "move"
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
    const id = options.stopId || options.id || htmlProps.id;

    warning(
      !!options.stopId,
      "[reakit]",
      "The `stopId` prop has been deprecated. Please, use the `id` prop instead."
    );

    const trulyDisabled = options.disabled && !options.focusable;
    const noFocused = options.currentId == null;
    const focused = options.currentId === id;
    const item = (options.items || []).find(s => s.id === id);
    const isFirst = (options.items || [])[0] && options.items[0].id === id;
    const shouldTabIndex = focused || (isFirst && noFocused);

    React.useEffect(() => {
      if (!id) return undefined;
      if (options.registerItem) {
        options.registerItem({ id, ref, disabled: trulyDisabled });
      }
      return () => {
        if (options.unregisterItem) {
          options.unregisterItem(id);
        }
      };
    }, [id, trulyDisabled, options.registerItem, options.unregisterItem]);

    const handleFocus = React.useCallback(
      (currentTarget: Element, target: Element = currentTarget) => {
        if (!id || !currentTarget.contains(target)) return;
        options.move && options.move(id);
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          // currentTarget.scrollIntoViewIfNeeded();
          if (
            getActiveElement(currentTarget) !==
            options.unstable_compositeRef.current
          ) {
            options.unstable_compositeRef.current?.focus();
          }
        }
      },
      [
        options.move,
        id,
        options.unstable_focusStrategy,
        options.unstable_compositeRef
      ]
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        handleFocus(event.currentTarget, event.target);
      },
      [handleFocus]
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
          if (!hasFocusWithin(options.unstable_compositeRef.current!)) {
            handleFocus(self);
          }
        } else {
          self.focus();
        }
      }
    }, [
      onFocus,
      id,
      focused,
      options.unstable_moves,
      options.unstable_focusStrategy
    ]);

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          event.preventDefault();
          handleFocus(event.currentTarget);
        }
      },
      [onFocus, options.unstable_focusStrategy]
    );

    // Add widgetHasFocus state to useCompositeState
    // Check on shouldKeyDown if it has a [data-composite-item-widget] as a child
    // If so, and key is Enter, Space or alphanumeric (and the widget is a text field)
    // return true. Otherwise return false.
    // Navigation will not be disabled here
    // When widgetHasFocus is true, all widgets will have tabIndex={0}. Otherwise -1.
    // Set widgetHasFocus to true on widget onFocus.
    // Pressing enter or escape on the widget should set widgetHasFocus to false
    // Escape should undo the value change
    // onBlur on composite sets widgetHasFocus to false.
    // onFocus on composite item (exact) sets widgetHasFocus to false.
    // Try to set widgetHasFocus to false on widget blur (not sure if it'll conflict with tab key)
    // What if there are other tabbable elements inside the grid? outside a row/item?
    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          shouldKeyDown: event => event.currentTarget === event.target,
          keyMap: () => {
            return {
              ArrowUp:
                item?.rowId || options.orientation !== "horizontal"
                  ? () => {
                      if (item?.rowId) {
                        options.up && options.up();
                      } else if (options.orientation !== "horizontal") {
                        options.previous && options.previous();
                      }
                    }
                  : undefined,
              ArrowRight:
                item?.rowId || options.orientation !== "vertical"
                  ? () => {
                      if (item?.rowId || options.orientation !== "vertical") {
                        options.next && options.next();
                      }
                    }
                  : undefined,
              ArrowDown:
                item?.rowId || options.orientation !== "horizontal"
                  ? () => {
                      if (item?.rowId) {
                        options.down && options.down();
                      } else if (options.orientation !== "horizontal") {
                        options.next && options.next();
                      }
                    }
                  : undefined,
              ArrowLeft:
                item?.rowId || options.orientation !== "vertical"
                  ? () => {
                      if (item?.rowId || options.orientation !== "vertical") {
                        options.previous && options.previous();
                      }
                    }
                  : undefined,
              Home: event => {
                if (item?.rowId) {
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
                if (item?.rowId) {
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
                if (item?.rowId) {
                  options.up && options.up(true);
                } else {
                  options.first && options.first();
                }
              },
              PageDown: () => {
                if (item?.rowId) {
                  options.down && options.down(true);
                } else {
                  options.last && options.last();
                }
              }
            };
          }
        }),
      [
        htmlOnKeyDown,
        item,
        options.orientation,
        options.previous,
        options.next,
        options.first,
        options.last
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id,
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
    htmlProps = useTabbable(options, htmlProps, true);
    if (options.unstable_focusStrategy === "aria-activedescendant") {
      return { ...htmlProps, onMouseDown: htmlProps.onMouseDown };
    }
    return htmlProps;
  }
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem
});
