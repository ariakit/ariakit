import { HTMLAttributes, useState } from "react";
import { DialogOptions, useDialog } from "../dialog/dialog.jsx";
import {
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { PopoverContext } from "./popover-context.js";
import { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `Popover` component.
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
    const popoverElement = store.useState("popoverElement");
    const contentElement = store.useState("contentElement");

    // Makes sure the wrapper element that's passed to popper has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    useSafeLayoutEffect(() => {
      const wrapper = popoverElement;
      const popover = contentElement;
      if (!wrapper) return;
      if (!popover) return;
      wrapper.style.zIndex = getComputedStyle(popover).zIndex;
    }, [popoverElement, contentElement]);

    // We have to wait for the popover to be positioned before we can move
    // focus, otherwise there may be scroll jumps. See popover-standalone
    // example test-browser file.
    const [canAutoFocusOnShow, setCanAutoFocusOnShow] = useState(false);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);
    const mounted = store.useState("mounted");

    useSafeLayoutEffect(() => {
      if (!domReady) return;
      if (!mounted) return;
      if (!contentElement?.isConnected) return;
      const raf = requestAnimationFrame(() => {
        setCanAutoFocusOnShow(true);
      });
      return () => {
        cancelAnimationFrame(raf);
      };
    }, [domReady, mounted, contentElement]);

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
 * Renders a popover element.
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

export interface PopoverOptions<T extends As = "div"> extends DialogOptions<T> {
  /**
   * Object returned by the `usePopoverStore` hook.
   */
  store: PopoverStore;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

export type PopoverProps<T extends As = "div"> = Props<PopoverOptions<T>>;
