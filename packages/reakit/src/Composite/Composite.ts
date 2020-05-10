import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useCreateElement } from "reakit-system/useCreateElement";
import { useForkRef } from "reakit-utils/useForkRef";
import { warning, useWarning } from "reakit-warning";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { getDocument } from "reakit-utils/getDocument";
import { fireEvent } from "reakit-utils/fireEvent";
import { fireKeyboardEvent } from "reakit-utils/fireKeyboardEvent";
import { isSelfTarget } from "reakit-utils/isSelfTarget";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { useTabbable, TabbableOptions, TabbableHTMLProps } from "../Tabbable";
import { useBox } from "../Box/Box";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState,
} from "./CompositeState";
import { Item } from "./__utils/types";
import { groupItems } from "./__utils/groupItems";
import { flatten } from "./__utils/flatten";
import { findFirstEnabledItem } from "./__utils/findFirstEnabledItem";
import { reverse } from "./__utils/reverse";
import { getCurrentId } from "./__utils/getCurrentId";
import { getNextActiveElementOnBlur } from "./__utils/getNextActiveElementOnBlur";
import { findEnabledItemById } from "./__utils/findEnabledItemById";

export type unstable_CompositeOptions = TabbableOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    | "baseId"
    | "unstable_virtual"
    | "currentId"
    | "orientation"
    | "unstable_moves"
    | "wrap"
    | "groups"
  > &
  Pick<
    unstable_CompositeStateReturn,
    "items" | "setCurrentId" | "first" | "last" | "move"
  >;

export type unstable_CompositeHTMLProps = TabbableHTMLProps;

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
  "treegrid",
];

const isIE11 = typeof window !== "undefined" && "msCrypto" in window;

function canProxyKeyboardEvent(event: React.KeyboardEvent) {
  if (!isSelfTarget(event)) return false;
  if (event.metaKey) return false;
  if (event.key === "Tab") return false;
  return true;
}

function useKeyboardEventProxy(
  virtual?: boolean,
  currentItem?: Item,
  htmlEventHandler?: React.KeyboardEventHandler
) {
  const eventHandlerRef = useLiveRef(htmlEventHandler);
  return React.useCallback(
    (event: React.KeyboardEvent) => {
      if (virtual && canProxyKeyboardEvent(event)) {
        const currentElement = currentItem?.ref.current;
        if (currentElement) {
          fireKeyboardEvent(currentElement, event.type, event);
          // The event will be triggered on the composite item and then
          // propagated up to this composite element again, so we can pretend
          // that it wasn't called on this component in the first place.
          if (event.currentTarget.contains(currentElement)) {
            event.stopPropagation();
            event.preventDefault();
            return;
          }
        }
      }
      eventHandlerRef.current?.(event);
    },
    [virtual, currentItem]
  );
}

// istanbul ignore next
function useActiveElementRef(elementRef: React.RefObject<HTMLElement>) {
  const activeElementRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const document = getDocument(elementRef.current);
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      activeElementRef.current = target;
    };
    document.addEventListener("focus", onFocus, true);
    return () => {
      document.removeEventListener("focus", onFocus, true);
    };
  }, []);
  return activeElementRef;
}

function findFirstEnabledItemInTheLastRow(items: Item[]) {
  return findFirstEnabledItem(flatten(reverse(groupItems(items))));
}

function isItem(items: Item[], element?: Element | EventTarget | null) {
  return items?.some((item) => !!element && item.ref.current === element);
}

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  compose: [useTabbable],
  useState: unstable_useCompositeState,

  useOptions(options) {
    return { ...options, currentId: getCurrentId(options) };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      onFocus: htmlOnFocus,
      onBlur: htmlOnBlur,
      onKeyDown: htmlOnKeyDown,
      onKeyUp: htmlOnKeyUp,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const currentItem = findEnabledItemById(options.items, options.currentId);
    const previousItem = React.useRef<Item | undefined>(undefined);
    const onFocusRef = useLiveRef(htmlOnFocus);
    const onBlurRef = useLiveRef(htmlOnBlur);
    // IE 11 doesn't support event.relatedTarget, so we use the active element
    // ref instead.
    const activeElementRef = isIE11 ? useActiveElementRef(ref) : undefined;

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "Can't focus composite component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/composite"
        );
        return;
      }
      if (options.unstable_moves && !currentItem) {
        // If composite.move(null) has been called, the composite container
        // will receive focus.
        self.focus();
      }
    }, [options.unstable_moves, currentItem]);

    const onKeyDown = useKeyboardEventProxy(
      options.unstable_virtual,
      currentItem,
      htmlOnKeyDown
    );

    const onKeyUp = useKeyboardEventProxy(
      options.unstable_virtual,
      currentItem,
      htmlOnKeyUp
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (options.unstable_virtual) {
          // IE11 doesn't support event.relatedTarget, so we use the active
          // element ref instead.
          const previousActiveElement =
            activeElementRef?.current || event.relatedTarget;
          const previousActiveElementWasItem = isItem(
            options.items,
            previousActiveElement
          );
          if (isSelfTarget(event) && !previousActiveElementWasItem) {
            // This means that the composite element has been focused while the
            // composite item has not. For example, by clicking on the
            // composite element without touching any item, or by tabbing into
            // the composite element. In this case, we want to trigger focus on
            // the item, just like it would happen with roving tabindex.
            // When it receives focus, the composite item will put focus back
            // on the composite element, in which case hasItemWithFocus will be
            // true.
            onFocusRef.current?.(event);
            currentItem?.ref.current?.focus();
            return;
          }
          if (previousActiveElementWasItem) {
            // Composite has been focused as a result of an item receiving
            // focus. The composite item will move focus back to the composite
            // container. In this case, we don't want to propagate this
            // additional event nor call the onFocus handler passed to
            // <Composite onFocus={...} /> (htmlOnFocus). Unless users add DOM
            // event handlers to the composite element directly, this will be
            // like this event has never existed.
            event.stopPropagation();
            return;
          }
        } else if (isSelfTarget(event)) {
          // When the roving tabindex composite gets intentionally focused (for
          // example, by clicking directly on it, and not on an item), we make
          // sure to set the current id to null (which means the composite
          // itself is focused).
          options.setCurrentId?.(null);
        }
        onFocusRef.current?.(event);
      },
      [
        options.unstable_virtual,
        options.items,
        currentItem,
        options.setCurrentId,
      ]
    );

    const onBlur = React.useCallback(
      (event: React.FocusEvent) => {
        // When virtual is set to true, we move focus from the composite
        // container (this component) to the composite item that is being
        // selected. Then we move focus back to the composite container. This
        // is so we can provide the same API as the roving tabindex method,
        // which means people can attach onFocus/onBlur handlers on the
        // CompositeItem component regardless of whether it's virtual or not.
        // This sequence of blurring and focusing items and composite may be
        // confusing, so we ignore intermediate focus and blurs by stopping its
        // propagation and not calling the passed onBlur handler (htmlOnBlur).
        if (options.unstable_virtual) {
          const targetIsItem = isItem(options.items, event.target);
          const nextActiveElement = getNextActiveElementOnBlur(event);
          const nextActiveElementIsItem = isItem(
            options.items,
            nextActiveElement
          );
          if (isSelfTarget(event) && nextActiveElementIsItem) {
            // This is an intermediate blur event: blurring the composite
            // container to focus an item (nextActiveElement). We ignore this
            // event.
            if (previousItem.current?.ref.current) {
              // If there's a previous active item we fire a blur event on it
              // so it will work just like if it had DOM focus before (like when
              // using roving tabindex).
              fireEvent(previousItem.current.ref.current, "blur", event);
            }
            previousItem.current = currentItem;
            event.stopPropagation();
            return;
          }
          if (!targetIsItem) {
            // If target is another thing (probably something outside of the
            // composite container), we don't ignore the event, but we should
            // reset the previousItem reference.
            if (currentItem?.ref.current) {
              fireEvent(currentItem.ref.current, "blur", event);
            }
            previousItem.current = undefined;
          } else {
            previousItem.current = currentItem;
          }
        }
        onBlurRef.current?.(event);
      },
      [options.unstable_virtual, options.items, currentItem]
    );

    const onMove = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown,
          stopPropagation: true,
          shouldKeyDown: (event) =>
            isSelfTarget(event) && options.currentId === null,
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
            const first = options.first && (() => options.first());
            const last = options.last && (() => options.last());
            return {
              ArrowUp: (isGrid || isVertical) && up,
              ArrowRight: (isGrid || isHorizontal) && first,
              ArrowDown: (isGrid || isVertical) && first,
              ArrowLeft: (isGrid || isHorizontal) && last,
              Home: first,
              End: last,
              PageUp: first,
              PageDown: last,
            };
          },
        }),
      [
        onKeyDown,
        options.currentId,
        options.orientation,
        options.groups,
        options.items,
        options.move,
        options.last,
        options.first,
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id: options.baseId,
      onFocus,
      onBlur,
      onKeyDown: onMove,
      onKeyUp,
      "aria-activedescendant": options.unstable_virtual
        ? currentItem?.id || undefined
        : undefined,
      ...htmlProps,
    };
  },

  useComposeProps(options, htmlProps) {
    htmlProps = useBox(options, htmlProps, true);
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.unstable_virtual || options.currentId === null) {
      // Composite will only be tabbable by default if the focus is managed
      // using aria-activedescendant, which requires DOM focus on the container
      // element (the composite)
      return tabbableHTMLProps;
    }
    return { ...htmlProps, ref: tabbableHTMLProps.ref };
  },
});

export const unstable_Composite = createComponent({
  as: "div",
  useHook: unstable_useComposite,
  useCreateElement: (type, props, children) => {
    useWarning(
      validCompositeRoles.indexOf(props.role) === -1,
      "You should provide a valid `role` attribute to composite components.",
      "See https://reakit.io/docs/composite"
    );

    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/composite"
    );

    return useCreateElement(type, props, children);
  },
});
