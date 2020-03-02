import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { getActiveElement } from "reakit-utils/getActiveElement";
import { getDocument } from "reakit-utils/getDocument";
import { isTextField } from "reakit-utils/isTextField";
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
    | "baseId"
    | "unstable_focusStrategy"
    | "unstable_hasActiveWidget"
    | "items"
    | "currentId"
    | "registerItem"
    | "unregisterItem"
    | "setCurrentId"
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
     * @deprecated Use `id` instead.
     * @private
     */
    stopId?: string;
  };

export type unstable_CompositeItemHTMLProps = TabbableHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeItemProps = unstable_CompositeItemOptions &
  unstable_CompositeItemHTMLProps;

// TODO: WARN IF IT'S A BUTTON OR ANOTHER TABBABLE ELEMENT AND HAS WIDGET INSIDE
export const unstable_useCompositeItem = createHook<
  unstable_CompositeItemOptions,
  unstable_CompositeItemHTMLProps
>({
  name: "CompositeItem",
  compose: [useTabbable, unstable_useId],
  useState: unstable_useCompositeState,
  keys: ["stopId"],

  useOptions(options) {
    return {
      ...options,
      unstable_clickOnSpace: options.unstable_hasActiveWidget
        ? false
        : options.unstable_clickOnSpace
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex = 0,
      onFocus: htmlOnFocus,
      onKeyDown: htmlOnKeyDown,
      onMouseDown: htmlOnMouseDown,
      onClick: htmlOnClick,
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
        if (target.hasAttribute("data-composite-item-widget")) {
          options.setCurrentId && options.setCurrentId(id);
        } else {
          options.move && options.move(id);
        }
        if (
          options.unstable_focusStrategy === "aria-activedescendant" &&
          currentTarget === target
        ) {
          // currentTarget.scrollIntoViewIfNeeded();
          const composite = getDocument(currentTarget).getElementById(
            options.baseId
          );
          if (getActiveElement(currentTarget) !== composite) {
            composite?.focus();
          }
        }
      },
      [options.move, id, options.unstable_focusStrategy, options.baseId]
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
          const composite = getDocument(self).getElementById(options.baseId);
          if (composite && !hasFocusWithin(composite)) {
            handleFocus(self);
          }
        } else {
          self.focus();
        }
      }
    }, [
      onFocus,
      focused,
      options.unstable_moves,
      options.unstable_focusStrategy,
      options.baseId
    ]);

    const onMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
        if (options.unstable_focusStrategy === "aria-activedescendant") {
          if (
            (event.target as Element).hasAttribute("data-composite-item-widget")
          ) {
            return;
          }
          event.preventDefault();
          handleFocus(event.currentTarget);
        }
      },
      [onFocus, options.unstable_focusStrategy]
    );

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
              },
              Delete: (event: React.KeyboardEvent) => {
                const widget = event.currentTarget.querySelector<HTMLElement>(
                  "[data-composite-item-widget]"
                );
                if (widget && isTextField(widget)) {
                  if (widget.isContentEditable) {
                    widget.innerHTML = "";
                  } else {
                    (widget as HTMLInputElement).value = "";
                  }
                }
              },
              Backspace: (event: React.KeyboardEvent) => {
                const widget = event.currentTarget.querySelector<HTMLElement>(
                  "[data-composite-item-widget]"
                );
                if (widget && isTextField(widget)) {
                  if (widget.isContentEditable) {
                    widget.innerHTML = "";
                  } else {
                    (widget as HTMLInputElement).value = "";
                  }
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
        options.last,
        options.up,
        options.down
      ]
    );

    const otherOnKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.currentTarget !== event.target) {
        return;
      }
      if (event.key.length === 1 && event.key !== " ") {
        const widget = event.currentTarget.querySelector<HTMLElement>(
          "[data-composite-item-widget]"
        );
        if (widget && isTextField(widget)) {
          widget.focus();
          const { key } = event;
          window.requestAnimationFrame(() => {
            if (widget.isContentEditable) {
              widget.innerHTML = key;
            } else {
              (widget as HTMLInputElement).value = key;
            }
          });
        }
      }
    }, []);

    const onClick = React.useCallback((event: React.MouseEvent) => {
      const widget = event.currentTarget.querySelector<HTMLElement>(
        "[data-composite-item-widget]"
      );
      if (widget && !hasFocusWithin(widget)) {
        widget.focus();
        widget.click();
      }
    }, []);

    return {
      ref: useForkRef(ref, htmlRef),
      id,
      "aria-selected":
        options.unstable_focusStrategy === "aria-activedescendant" && focused
          ? true
          : undefined,
      tabIndex:
        options.unstable_focusStrategy !== "aria-activedescendant" &&
        !options.unstable_hasActiveWidget &&
        shouldTabIndex
          ? htmlTabIndex
          : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onMouseDown: useAllCallbacks(onMouseDown, htmlOnMouseDown),
      onKeyDown: useAllCallbacks(otherOnKeyDown, onKeyDown),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      "data-composite-item": true,
      "data-focused": true,
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    // @ts-ignore
    htmlProps = unstable_useId(options, htmlProps, true);
    // @ts-ignore
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.unstable_focusStrategy === "aria-activedescendant") {
      return {
        ...tabbableHTMLProps,
        onMouseDown: htmlProps.onMouseDown
      };
    }
    return tabbableHTMLProps;
  }
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem
});
