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

export type unstable_CompositeOptions = TabbableOptions &
  unstable_IdGroupOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "unstable_focusStrategy" | "orientation" | "unstable_moves"
  > &
  Pick<
    unstable_CompositeStateReturn,
    "items" | "groups" | "currentId" | "first" | "last"
  >;

export type unstable_CompositeHTMLProps = TabbableHTMLProps &
  unstable_IdGroupHTMLProps;

export type unstable_CompositeProps = unstable_CompositeOptions &
  unstable_CompositeHTMLProps;

const validCompositeRoles = [
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

function getCurrentItem({ items, currentId }: unstable_CompositeOptions) {
  return items?.find(item => item.id === currentId);
}

function canProxyKeyboardEvent(event: React.KeyboardEvent) {
  if (event.target !== event.currentTarget) return false;
  if (event.metaKey) return false;
  if (event.key === "Tab") return false;
  return true;
}

function useKeyboardEventProxy(currentItem?: Item) {
  return React.useCallback(
    (event: React.KeyboardEvent) => {
      if (canProxyKeyboardEvent(event)) {
        const currentElement = currentItem?.ref.current;
        if (currentElement) {
          currentElement.dispatchEvent(new KeyboardEvent(event.type, event));
          event.preventDefault();
        }
      }
    },
    [currentItem]
  );
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
      onKeyDown: htmlOnKeyDown,
      onKeyUp: htmlOnKeyUp,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const currentItem = getCurrentItem(options);
    const onKeyDown = useKeyboardEventProxy(currentItem);
    const onKeyUp = useKeyboardEventProxy(currentItem);

    React.useEffect(() => {
      const self = ref.current;
      if (!self) {
        // TODO: Warning
        return;
      }
      if (
        options.unstable_moves &&
        !currentItem &&
        getActiveElement(self) !== self
      ) {
        self.focus();
      }
    }, [options.unstable_moves, currentItem]);

    const bindings = React.useMemo(
      () =>
        createOnKeyDown({
          stopPropagation: true,
          shouldKeyDown: event =>
            event.target === event.currentTarget && !currentItem,
          keyMap: () => {
            const isVertical = options.orientation !== "horizontal";
            const isHorizontal = options.orientation !== "vertical";
            const isGrid = Boolean(options.groups?.length);
            return {
              ArrowUp: (isGrid || isVertical) && options.last,
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
        currentItem,
        options.orientation,
        options.groups,
        options.last,
        options.first
      ]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id: options.baseId,
      onKeyDown: useAllCallbacks(bindings, onKeyDown, htmlOnKeyDown),
      onKeyUp: useAllCallbacks(onKeyUp, htmlOnKeyUp),
      "aria-activedescendant":
        options.unstable_focusStrategy === "aria-activedescendant"
          ? currentItem?.id
          : undefined,
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    htmlProps = unstable_useIdGroup(options, htmlProps, true);
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (
      options.unstable_focusStrategy === "aria-activedescendant" ||
      !getCurrentItem(options)
    ) {
      // Composite will only be tabbable by default if the focus is managed
      // using aria-activedescendant, which requires DOM focus on the container
      // element (the composite)
      return tabbableHTMLProps;
    }
    return htmlProps;
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
