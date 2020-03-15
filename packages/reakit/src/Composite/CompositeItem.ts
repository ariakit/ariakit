import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { getDocument } from "reakit-utils/getDocument";
import { isTextField } from "reakit-utils/isTextField";
import { scrollIntoViewIfNeeded } from "reakit-utils/scrollIntoViewIfNeeded";
import {
  ClickableOptions,
  ClickableHTMLProps,
  useClickable
} from "../Clickable/Clickable";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";
import { setTextFieldValue } from "./__utils/setTextFieldValue";

export type unstable_CompositeItemOptions = ClickableOptions &
  unstable_IdOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    | "baseId"
    | "orientation"
    | "unstable_moves"
    | "unstable_focusStrategy"
    | "unstable_hasActiveWidget"
  > &
  Pick<
    unstable_CompositeStateReturn,
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

export type unstable_CompositeItemHTMLProps = ClickableHTMLProps &
  unstable_IdHTMLProps;

export type unstable_CompositeItemProps = unstable_CompositeItemOptions &
  unstable_CompositeItemHTMLProps;

function getWidget(item: Element) {
  return item.querySelector<HTMLElement>("[data-composite-item-widget]");
}

function moveCaretToEnd(contentEditableElement: HTMLElement) {
  const range = getDocument(contentEditableElement).createRange();
  range.selectNodeContents(contentEditableElement);
  range.collapse(false);
  const selection = getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export const unstable_useCompositeItem = createHook<
  unstable_CompositeItemOptions,
  unstable_CompositeItemHTMLProps
>({
  name: "CompositeItem",
  compose: [useClickable, unstable_useId],
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
      onClick: htmlOnClick,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const id = options.stopId || options.id || htmlProps.id;
    const trulyDisabled = options.disabled && !options.focusable;
    const isCurrentItem = options.currentId === id;
    const item = options.items?.find(i => i.id === id);
    const isVirtualFocus =
      options.unstable_focusStrategy === "aria-activedescendant";
    const shouldTabIndex =
      (!isVirtualFocus && !options.unstable_hasActiveWidget && isCurrentItem) ||
      // We don't want to set tabIndex="-1" when using CompositeItem as a
      // standalone component, without state props.
      !options.items;

    warning(
      !!options.stopId,
      "[reakit]",
      "The `stopId` prop has been deprecated. Please, use the `id` prop instead."
    );

    React.useEffect(() => {
      if (!id) return undefined;
      options.registerItem?.({ id, ref, disabled: Boolean(trulyDisabled) });
      return () => {
        options.unregisterItem?.(id);
      };
    }, [id, trulyDisabled, options.registerItem, options.unregisterItem]);

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
      // `moves` will be incremented whenever next, previous, up, down, first,
      // last or move have been called. This means that the composite item will
      // be focused whenever some of these functions are called. Unless it has
      // already focus, in which case we don't want to focus it again.
      if (options.unstable_moves && isCurrentItem && !hasFocusWithin(self)) {
        self.focus({ preventScroll: true });
        scrollIntoViewIfNeeded(self);
      }
    }, [options.unstable_moves, isCurrentItem]);

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        const { target, currentTarget } = event;
        if (!id || !currentTarget.contains(target)) return;
        if (isVirtualFocus) {
          options.setCurrentId?.(id);
        } else {
          options.move?.(id);
        }
        // When using aria-activedescendant, we want to make sure that the
        // composite container receives focus, not the composite item.
        // But we don't want to do this if the target is another focusable
        // element inside the composite item, such as CompositeItemWidget.
        if (isVirtualFocus && currentTarget === target && options.baseId) {
          const composite = getDocument(target).getElementById(options.baseId);
          composite?.focus();
        }
      },
      [id, isVirtualFocus, options.setCurrentId, options.move, options.baseId]
    );

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          // We don't want to listen to focusable elements inside the composite
          // item, such as a CompositeItemWidget.
          shouldKeyDown: event => event.currentTarget === event.target,
          keyMap: () => {
            // `options.orientation` can also be undefined, which means that
            // both `isVertical` and `isHorizontal` will be `true`.
            const isVertical = options.orientation !== "horizontal";
            const isHorizontal = options.orientation !== "vertical";
            const isGrid = Boolean(item?.groupId);

            const ArrowUp =
              (isGrid || isVertical) &&
              (() => (isGrid ? options.up?.() : options.previous?.()));

            const ArrowRight =
              (isGrid || isHorizontal) && (() => options.next?.());

            const ArrowDown =
              (isGrid || isVertical) &&
              (() => (isGrid ? options.down?.() : options.next?.()));

            const ArrowLeft =
              (isGrid || isHorizontal) && (() => options.previous?.());

            const Delete = (event: React.KeyboardEvent) => {
              const widget = getWidget(event.currentTarget);
              if (widget && isTextField(widget)) {
                setTextFieldValue(widget, "");
              }
            };

            return {
              Delete,
              Backspace: Delete,
              ArrowUp,
              ArrowRight,
              ArrowDown,
              ArrowLeft,
              Home: event => {
                if (!isGrid || event.ctrlKey) {
                  options.first?.();
                } else {
                  options.previous?.(true);
                }
              },
              End: event => {
                if (!isGrid || event.ctrlKey) {
                  options.last?.();
                } else {
                  options.next?.(true);
                }
              },
              PageUp: () => {
                if (isGrid) {
                  options.up?.(true);
                } else {
                  options.first?.();
                }
              },
              PageDown: () => {
                if (isGrid) {
                  options.down?.(true);
                } else {
                  options.last?.();
                }
              }
            };
          }
        }),
      [
        htmlOnKeyDown,
        item,
        options.orientation,
        options.next,
        options.previous,
        options.up,
        options.down,
        options.first,
        options.last
      ]
    );

    const onCharacterKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.currentTarget !== event.target) return;
        if (event.key.length === 1 && event.key !== " ") {
          const widget = getWidget(event.currentTarget);
          if (widget && isTextField(widget)) {
            widget.focus();
            const { key } = event;
            // Using RAF here because otherwise the key will be added twice
            // to the input when using roving tabindex
            window.requestAnimationFrame(() => {
              setTextFieldValue(widget, key);
              if (widget.isContentEditable) {
                moveCaretToEnd(widget);
              }
            });
          }
        }
      },
      []
    );

    // Make sure the widget is focused on enter, space or click
    const onClick = React.useCallback((event: React.MouseEvent) => {
      const widget = getWidget(event.currentTarget);
      if (widget && !hasFocusWithin(widget)) {
        widget.focus();
        if (widget.isContentEditable) {
          moveCaretToEnd(widget);
        }
      }
    }, []);

    return {
      ref: useForkRef(ref, htmlRef),
      id,
      "aria-selected": isVirtualFocus && isCurrentItem ? true : undefined,
      tabIndex: shouldTabIndex ? htmlTabIndex : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onKeyDown: useAllCallbacks(onCharacterKeyDown, onKeyDown),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem
});
