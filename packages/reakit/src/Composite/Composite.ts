import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useCreateElement } from "reakit-system/useCreateElement";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { warning } from "reakit-utils/warning";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { getActiveElement } from "reakit-utils/getActiveElement";
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
import { Item } from "./__utils/types";
import { groupItems } from "./__utils/groupItems";
import { flatten } from "./__utils/flatten";
import { findFirstEnabledItem } from "./__utils/findFirstEnabledItem";
import { reverse } from "./__utils/reverse";
import { getCurrentId } from "./__utils/getCurrentId";

export type unstable_CompositeOptions = TabbableOptions &
  unstable_IdGroupOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "virtual" | "currentId" | "orientation" | "moves" | "wrap" | "groups"
  > &
  Pick<
    unstable_CompositeStateReturn,
    "items" | "setCurrentId" | "first" | "last" | "move"
  >;

export type unstable_CompositeHTMLProps = TabbableHTMLProps &
  unstable_IdGroupHTMLProps;

export type unstable_CompositeProps = unstable_CompositeOptions &
  unstable_CompositeHTMLProps;

const validCompositeRoles = [
  "combobox",
  "grid",
  "tablist",
  "listbox",
  "menu",
  "menubar",
  "toolbar",
  "radiogroup",
  "tree",
  "treegrid"
];

function getCurrentItem(
  items: unstable_CompositeOptions["items"],
  currentId: unstable_CompositeOptions["currentId"]
) {
  return items?.find(item => item.id === currentId);
}

function canProxyKeyboardEvent(event: React.KeyboardEvent) {
  if (event.target !== event.currentTarget) return false;
  if (event.metaKey) return false;
  if (event.key === "Tab") return false;
  return true;
}

function useKeyboardEventProxy(
  virtual?: boolean,
  currentItem?: Item,
  htmlEventHandler?: React.KeyboardEventHandler
) {
  return React.useCallback(
    (event: React.KeyboardEvent) => {
      if (virtual && canProxyKeyboardEvent(event)) {
        const currentElement = currentItem?.ref.current;
        if (currentElement) {
          // TODO: Refactor && Test
          const keyboardEvent = new KeyboardEvent(event.type, event);
          let isPropagationStopped = false;
          const stopPropagation = keyboardEvent.stopPropagation.bind(
            keyboardEvent
          );
          keyboardEvent.stopPropagation = () => {
            stopPropagation();
            isPropagationStopped = true;
          };
          currentElement.dispatchEvent(keyboardEvent);
          if (keyboardEvent.defaultPrevented) {
            event.preventDefault();
          }
          // if (isPropagationStopped) {
          // }
          event.stopPropagation();
          return;
        }
      }
      htmlEventHandler?.(event);
    },
    [virtual, currentItem, htmlEventHandler]
  );
}

function findFirstEnabledItemInTheLastRow(items: Item[]) {
  return findFirstEnabledItem(flatten(reverse(groupItems(items))));
}

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  compose: [unstable_useIdGroup, useTabbable],
  useState: unstable_useCompositeState,

  useProps(
    options,
    {
      ref: htmlRef,
      onFocus: htmlOnFocus,
      onKeyDown: htmlOnKeyDown,
      onKeyUp: htmlOnKeyUp,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const currentId = getCurrentId(options);
    const currentItem = getCurrentItem(options.items, currentId);
    const onKeyDown = useKeyboardEventProxy(
      options.virtual,
      currentItem,
      htmlOnKeyDown
    );
    const onKeyUp = useKeyboardEventProxy(
      options.virtual,
      currentItem,
      htmlOnKeyUp
    );

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "[reakit/Composite]",
          "Can't focus composite component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/composite"
        );
        return;
      }
      if (options.moves && !currentItem) {
        if (getActiveElement(self) === self) {
          self.dispatchEvent(new FocusEvent("focus"));
        }
        self.focus();
      }
    }, [options.moves, currentItem]);

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (event.target !== event.currentTarget) return;
        if (options.virtual) {
          if (!currentId || !options.items) return;
          const hasItemWithFocus = options.items.some(
            item => item.ref.current === event.relatedTarget
          );
          // It means that the composite element has been focused while the
          // composite item has not. For example, by clicking on the composite
          // element without touching any item, or by tabbing into the
          // composite element. In this case, we want to trigger focus on the
          // item, just like it would happen with roving tabindex.
          // When it receives focus, the composite item will put focus back on
          // the composite element, in which case event.target will be
          // different from event.currentTarget.
          if (!hasItemWithFocus) {
            options.move?.(currentId);
          }
        } else {
          // When the roving tabindex composite gets intentionally focused (for
          // example, by clicking directly on it, and not on an item), we make
          // sure to set the current id to null (which means the composite
          // itself is focused).
          options.setCurrentId?.(null);
        }
      },
      [
        options.virtual,
        options.items,
        currentId,
        options.move,
        options.setCurrentId
      ]
    );

    const onMove = React.useMemo(
      () =>
        createOnKeyDown({
          stopPropagation: true,
          shouldKeyDown: event =>
            event.target === event.currentTarget && options.currentId === null,
          keyMap: () => {
            const isVertical = options.orientation !== "horizontal";
            const isHorizontal = options.orientation !== "vertical";
            const isGrid = !!options.groups?.length;
            const up = () => {
              if (isGrid) {
                const item = findFirstEnabledItemInTheLastRow(options.items);
                if (item?.id) {
                  options.move?.(item.id);
                }
              } else {
                options.last?.();
              }
            };
            return {
              ArrowUp: (isGrid || isVertical) && up,
              ArrowRight: (isGrid || isHorizontal) && options.first,
              ArrowDown: (isGrid || isVertical) && options.first,
              ArrowLeft: (isGrid || isHorizontal) && options.last,
              Home: options.first,
              End: options.last,
              PageUp: options.first,
              PageDown: options.last
            };
          }
        }),
      [
        options.currentId,
        options.orientation,
        options.groups,
        options.items,
        options.last,
        options.first,
        options.move
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id: options.baseId,
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onKeyDown: useAllCallbacks(onMove, onKeyDown),
      onKeyUp,
      "aria-activedescendant": options.virtual
        ? currentItem?.id || undefined
        : undefined,
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    htmlProps = unstable_useIdGroup(options, htmlProps, true);
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.virtual || options.currentId === null) {
      // Composite will only be tabbable by default if the focus is managed
      // using aria-activedescendant, which requires DOM focus on the container
      // element (the composite)
      return tabbableHTMLProps;
    }
    return { ...htmlProps, ref: tabbableHTMLProps.ref };
  }
});

export const unstable_Composite = createComponent({
  as: "div",
  useHook: unstable_useComposite,
  useCreateElement: (type, props, children) => {
    warning(
      validCompositeRoles.indexOf(props.role) === -1,
      `[reakit/Composite]`,
      "You should provide a valid `role` attribute to composite components.",
      "See https://reakit.io/docs/composite"
    );

    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `[reakit/Composite]`,
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/composite"
    );

    return useCreateElement(type, props, children);
  }
});
