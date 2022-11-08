import { HTMLAttributes, useState } from "react";
import { usePortalRef, useWrapElement } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { DialogOptions, useDialog } from "../dialog/store-dialog";
import { PopoverContext } from "./__store-utils";
import { PopoverStore } from "./store-popover-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopover({ store });
 * <Role {...props}>Popover</Role>
 * ```
 */
export const usePopover = createHook<PopoverOptions>(
  ({
    store,
    modal = false,
    portal = !!modal,
    preserveTabOrder = true,
    autoFocusOnShow = true,
    wrapperProps,
    ...props
  }) => {
    // Makes sure the wrapper element that's passed to popper has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    store.useEffect(
      (state) => {
        const wrapper = state.popoverElement;
        const popover = state.contentElement;
        if (!wrapper) return;
        if (!popover) return;
        wrapper.style.zIndex = getComputedStyle(popover).zIndex;
      },
      ["popoverElement", "contentElement"]
    );

    // We have to wait for the popover to be positioned before we can move
    // focus, otherwise there may be scroll jumps. See popover-standalone
    // example test-browser file.
    const [canAutoFocusOnShow, setCanAutoFocusOnShow] = useState(false);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    store.useSync(
      (state) => {
        if (!domReady) return;
        if (!state.mounted) return;
        if (!state.contentElement?.isConnected) return;
        setCanAutoFocusOnShow(true);
      },
      ["mounted", "contentElement", domReady]
    );

    const position = store.useState((state) =>
      state.fixed ? "fixed" : "absolute"
    );

    // Wrap our element in a div that will be used to position the popover.
    // This way the user doesn't need to override the popper's position to
    // create animations.
    props = useWrapElement(
      props,
      (element) => (
        <div
          role="presentation"
          {...wrapperProps}
          style={{
            position,
            top: 0,
            left: 0,
            ...wrapperProps?.style,
          }}
          ref={store.setPopoverElement}
        >
          {element}
        </div>
      ),
      [store, position, wrapperProps]
    );

    props = useWrapElement(
      props,
      (element) => (
        <PopoverContext.Provider value={store}>
          {element}
        </PopoverContext.Provider>
      ),
      [store]
    );

    props = {
      ...props,
      style: {
        position: "relative",
        ...props.style,
      },
    };

    props = useDialog({
      store,
      modal,
      preserveTabOrder,
      portal,
      autoFocusOnShow: canAutoFocusOnShow && autoFocusOnShow,
      ...props,
      portalRef,
    });

    return props;
  }
);

/**
 * A component that renders a popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>Disclosure</PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export const Popover = createComponent<PopoverOptions>((props) => {
  const htmlProps = usePopover(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Popover.displayName = "Popover";
}

export type PopoverOptions<T extends As = "div"> = Omit<
  DialogOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `usePopoverStore` hook.
   */
  store: PopoverStore;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
};

export type PopoverProps<T extends As = "div"> = Props<PopoverOptions<T>>;
