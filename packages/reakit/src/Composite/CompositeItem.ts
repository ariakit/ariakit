import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning, useWarning } from "reakit-warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { getDocument } from "reakit-utils/getDocument";
import { isTextField } from "reakit-utils/isTextField";
import { useLiveRef } from "reakit-utils/useLiveRef";
import {
  ClickableOptions,
  ClickableHTMLProps,
  useClickable,
} from "../Clickable/Clickable";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps,
} from "../Id/Id";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState,
} from "./CompositeState";
import { setTextFieldValue } from "./__utils/setTextFieldValue";
import { getCurrentId } from "./__utils/getCurrentId";

export type unstable_CompositeItemOptions = ClickableOptions &
  unstable_IdOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    | "unstable_virtual"
    | "baseId"
    | "orientation"
    | "unstable_moves"
    | "unstable_hasActiveWidget"
  > &
  Pick<
    unstable_CompositeStateReturn,
    | "items"
    | "currentId"
    | "registerItem"
    | "unregisterItem"
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
      id: options.stopId || options.id,
      currentId: getCurrentId(options),
      unstable_clickOnSpace: options.unstable_hasActiveWidget
        ? false
        : options.unstable_clickOnSpace,
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex = 0,
      onFocus: htmlOnFocus,
      onBlur: htmlOnBlur,
      onKeyDown: htmlOnKeyDown,
      onClick: htmlOnClick,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const { id } = options;
    const trulyDisabled = options.disabled && !options.focusable;
    const isCurrentItem = options.currentId === id;
    const isCurrentItemRef = useLiveRef(isCurrentItem);
    const hasFocusedComposite = React.useRef(false);
    const item = options.items?.find((i) => i.id === id);
    const shouldTabIndex =
      (!options.unstable_virtual &&
        !options.unstable_hasActiveWidget &&
        isCurrentItem) ||
      // We don't want to set tabIndex="-1" when using CompositeItem as a
      // standalone component, without state props.
      !options.items;

    useWarning(
      !!options.stopId,
      "The `stopId` prop has been deprecated. Please, use the `id` prop instead.",
      ref
    );

    React.useEffect(() => {
      if (!id) return undefined;
      options.registerItem?.({ id, ref, disabled: !!trulyDisabled });
      return () => {
        options.unregisterItem?.(id);
      };
    }, [id, trulyDisabled, options.registerItem, options.unregisterItem]);

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "Can't focus composite item component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/composite"
        );
        return;
      }
      // `moves` will be incremented whenever next, previous, up, down, first,
      // last or move have been called. This means that the composite item will
      // be focused whenever some of these functions are called. We're using
      // isCurrentItemRef instead of isCurrentItem because we don't want to
      // focus the item if isCurrentItem changes (and options.moves doesn't).
      if (options.unstable_moves && isCurrentItemRef.current) {
        self.focus();
      }
    }, [options.unstable_moves]);

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        const { target, currentTarget } = event;
        if (!id || !currentTarget.contains(target)) return;
        options.setCurrentId?.(id);
        // When using aria-activedescendant, we want to make sure that the
        // composite container receives focus, not the composite item.
        // But we don't want to do this if the target is another focusable
        // element inside the composite item, such as CompositeItemWidget.
        const targetIsSelf = currentTarget === target;
        if (targetIsSelf && options.unstable_virtual && options.baseId) {
          const composite = getDocument(target).getElementById(options.baseId);
          if (composite) {
            hasFocusedComposite.current = true;
            composite.focus();
          }
        }
      },
      [id, options.setCurrentId, options.unstable_virtual, options.baseId]
    );

    const onBlur = React.useCallback(
      (event: React.FocusEvent) => {
        if (options.unstable_virtual) {
          if (hasFocusedComposite.current) {
            // When hasFocusedComposite is true, composite has been focused
            // right after focusing this item. This is an intermediate blur
            // event, so we ignore it.
            hasFocusedComposite.current = false;
            event.stopPropagation();
            return;
          }
        }
        htmlOnBlur?.(event);
      },
      [options.unstable_virtual, htmlOnBlur]
    );

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          // We don't want to listen to focusable elements inside the composite
          // item, such as a CompositeItemWidget.
          shouldKeyDown: (event) => event.currentTarget === event.target,
          keyMap: () => {
            // `options.orientation` can also be undefined, which means that
            // both `isVertical` and `isHorizontal` will be `true`.
            const isVertical = options.orientation !== "horizontal";
            const isHorizontal = options.orientation !== "vertical";
            const isGrid = !!item?.groupId;
            const Delete = (event: React.KeyboardEvent) => {
              const widget = getWidget(event.currentTarget);
              if (widget && isTextField(widget)) {
                setTextFieldValue(widget, "");
              }
            };
            return {
              Delete,
              Backspace: Delete,
              ArrowUp: (isGrid || isVertical) && (() => options.up?.()),
              ArrowRight: (isGrid || isHorizontal) && (() => options.next?.()),
              ArrowDown: (isGrid || isVertical) && (() => options.down?.()),
              ArrowLeft:
                (isGrid || isHorizontal) && (() => options.previous?.()),
              Home: (event) => {
                if (!isGrid || event.ctrlKey) {
                  options.first?.();
                } else {
                  options.previous?.(true);
                }
              },
              End: (event) => {
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
              },
            };
          },
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
        options.last,
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
            });
          }
        }
      },
      []
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const self = event.currentTarget;
        const selfIsTarget = self === event.target;
        const widget = getWidget(self);
        if (widget && !hasFocusWithin(widget)) {
          // If there's a widget inside the composite item, we make sure it's
          // focused when pressing enter, space or clicking on the composite item.
          widget.focus();
        } else if (selfIsTarget && !hasFocusWithin(self)) {
          // VoiceOver doesn't automatically focus the composite item when it's not
          // a button, so we force focus here.
          self.focus();
        }
      },
      []
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id,
      "aria-selected":
        options.unstable_virtual && isCurrentItem ? true : undefined,
      tabIndex: shouldTabIndex ? htmlTabIndex : -1,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onBlur,
      onKeyDown: useAllCallbacks(onCharacterKeyDown, onKeyDown),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps,
    };
  },
});

export const unstable_CompositeItem = createComponent({
  as: "button",
  useHook: unstable_useCompositeItem,
});
