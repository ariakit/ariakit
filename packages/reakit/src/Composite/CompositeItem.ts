import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-warning";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { getDocument } from "reakit-utils/getDocument";
import { isTextField } from "reakit-utils/isTextField";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { isPortalEvent } from "reakit-utils/isPortalEvent";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import { ensureFocus } from "reakit-utils/ensureFocus";
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
import { CompositeStateReturn } from "./CompositeState";
import { setTextFieldValue } from "./__utils/setTextFieldValue";
import { getCurrentId } from "./__utils/getCurrentId";
import { Item } from "./__utils/types";
import { COMPOSITE_ITEM_KEYS } from "./__keys";

export type CompositeItemOptions = ClickableOptions &
  unstable_IdOptions &
  Pick<
    Partial<CompositeStateReturn>,
    | "unstable_virtual"
    | "baseId"
    | "orientation"
    | "unstable_moves"
    | "unstable_hasActiveWidget"
  > &
  Pick<
    CompositeStateReturn,
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
  >;

export type CompositeItemHTMLProps = ClickableHTMLProps & unstable_IdHTMLProps;

export type CompositeItemProps = CompositeItemOptions & CompositeItemHTMLProps;

function getWidget(itemElement: Element) {
  return itemElement.querySelector<HTMLElement>("[data-composite-item-widget]");
}

function useItem(options: CompositeItemOptions) {
  return React.useMemo(
    () => options.items?.find((item) => options.id && item.id === options.id),
    [options.items, options.id]
  );
}

function targetIsAnotherItem(event: React.SyntheticEvent, items: Item[]) {
  if (isSelfTarget(event)) return false;
  for (const item of items) {
    if (item.ref.current === event.target) {
      return true;
    }
  }
  return false;
}

export const useCompositeItem = createHook<
  CompositeItemOptions,
  CompositeItemHTMLProps
>({
  name: "CompositeItem",
  compose: [useClickable, unstable_useId],
  keys: COMPOSITE_ITEM_KEYS,

  propsAreEqual(prev, next) {
    if (!next.id || prev.id !== next.id) {
      return useClickable.unstable_propsAreEqual(prev, next);
    }
    const {
      currentId: prevCurrentId,
      unstable_moves: prevMoves,
      ...prevProps
    } = prev;
    const {
      currentId: nextCurrentId,
      unstable_moves: nextMoves,
      ...nextProps
    } = next;
    if (nextCurrentId !== prevCurrentId) {
      if (next.id === nextCurrentId || next.id === prevCurrentId) {
        return false;
      }
    } else if (prevMoves !== nextMoves) {
      return false;
    }
    return useClickable.unstable_propsAreEqual(prevProps, nextProps);
  },

  useOptions(options) {
    return {
      ...options,
      id: options.id,
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
    const item = useItem(options);
    const onFocusRef = useLiveRef(htmlOnFocus);
    const onBlurRef = useLiveRef(htmlOnBlur);
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);
    const onClickRef = useLiveRef(htmlOnClick);
    const shouldTabIndex =
      (!options.unstable_virtual &&
        !options.unstable_hasActiveWidget &&
        isCurrentItem) ||
      // We don't want to set tabIndex="-1" when using CompositeItem as a
      // standalone component, without state props.
      !options.items?.length;

    React.useEffect(() => {
      if (!id) return undefined;
      options.registerItem?.({ id, ref, disabled: !!trulyDisabled });
      return () => {
        options.unregisterItem?.(id);
      };
    }, [id, trulyDisabled, options.registerItem, options.unregisterItem]);

    React.useEffect(() => {
      const element = ref.current;
      if (!element) {
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
        element.focus();
      }
    }, [options.unstable_moves]);

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        onFocusRef.current?.(event);
        if (event.defaultPrevented) return;
        if (isPortalEvent(event)) return;
        if (!id) return;
        if (targetIsAnotherItem(event, options.items)) return;
        options.setCurrentId?.(id);
        // When using aria-activedescendant, we want to make sure that the
        // composite container receives focus, not the composite item.
        // But we don't want to do this if the target is another focusable
        // element inside the composite item, such as CompositeItemWidget.
        if (options.unstable_virtual && options.baseId && isSelfTarget(event)) {
          const { target } = event;
          const composite = getDocument(target).getElementById(options.baseId);
          if (composite) {
            hasFocusedComposite.current = true;
            ensureFocus(composite);
          }
        }
      },
      [
        id,
        options.items,
        options.setCurrentId,
        options.unstable_virtual,
        options.baseId,
      ]
    );

    const onBlur = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        if (options.unstable_virtual && hasFocusedComposite.current) {
          // When hasFocusedComposite is true, composite has been focused right
          // after focusing this item. This is an intermediate blur event, so
          // we ignore it.
          hasFocusedComposite.current = false;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onBlurRef.current?.(event);
      },
      [options.unstable_virtual]
    );

    const onCharacterKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        onKeyDownRef.current?.(event);
        if (!isSelfTarget(event)) return;
        if (event.key.length === 1 && event.key !== " ") {
          const widget = getWidget(event.currentTarget);
          if (widget && isTextField(widget)) {
            widget.focus();
            const { key } = event;
            // Using RAF here because otherwise the key will be added twice to
            // the input when using roving tabindex
            window.requestAnimationFrame(() => {
              setTextFieldValue(widget, key);
            });
          }
        }
      },
      []
    );

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: onCharacterKeyDown,
          stopPropagation: true,
          // We don't want to listen to focusable elements inside the composite
          // item, such as a CompositeItemWidget.
          shouldKeyDown: isSelfTarget,
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
            const up = options.up && (() => options.up());
            const next = options.next && (() => options.next());
            const down = options.down && (() => options.down());
            const previous = options.previous && (() => options.previous());
            return {
              Delete,
              Backspace: Delete,
              ArrowUp: (isGrid || isVertical) && up,
              ArrowRight: (isGrid || isHorizontal) && next,
              ArrowDown: (isGrid || isVertical) && down,
              ArrowLeft: (isGrid || isHorizontal) && previous,
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
        onCharacterKeyDown,
        options.orientation,
        item,
        options.up,
        options.next,
        options.down,
        options.previous,
        options.first,
        options.last,
      ]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        const element = event.currentTarget;
        const widget = getWidget(element);
        if (widget && !hasFocusWithin(widget)) {
          // If there's a widget inside the composite item, we make sure it's
          // focused when pressing enter, space or clicking on the composite item.
          widget.focus();
        }
      },
      []
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id,
      tabIndex: shouldTabIndex ? htmlTabIndex : -1,
      "aria-selected":
        options.unstable_virtual && isCurrentItem ? true : undefined,
      onFocus,
      onBlur,
      onKeyDown,
      onClick,
      ...htmlProps,
    };
  },
});

export const CompositeItem = createComponent({
  as: "button",
  memo: true,
  useHook: useCompositeItem,
});
