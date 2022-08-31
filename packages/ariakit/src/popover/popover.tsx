import { HTMLAttributes, RefObject, useState } from "react";
import {
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { DialogOptions, useDialog } from "../dialog/dialog";
import { PopoverContext } from "./__utils";
import { PopoverState } from "./popover-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const state = usePopoverState();
 * const props = usePopover({ state });
 * <Role {...props}>Popover</Role>
 * ```
 */
export const usePopover = createHook<PopoverOptions>(
  ({
    state,
    modal = false,
    portal = !!modal,
    preserveTabOrder = true,
    autoFocusOnShow = true,
    wrapperProps,
    ...props
  }) => {
    const popoverRef = state.popoverRef as RefObject<HTMLDivElement>;

    // Makes sure the wrapper element that's passed to popper has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    useSafeLayoutEffect(() => {
      const wrapper = popoverRef.current;
      const popover = state.contentElement;
      if (!wrapper) return;
      if (!popover) return;
      wrapper.style.zIndex = getComputedStyle(popover).zIndex;
    }, [popoverRef, state.contentElement]);

    // We have to wait for the popover to be positioned before we can move
    // focus, otherwise there may be scroll jumps. See popover-standalone
    // example test-browser file.
    const [canAutoFocusOnShow, setCanAutoFocusOnShow] = useState(false);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    useSafeLayoutEffect(() => {
      if (!domReady) return;
      if (!state.mounted) return;
      if (!state.contentElement?.isConnected) return;
      const raf = requestAnimationFrame(() => {
        setCanAutoFocusOnShow(true);
      });
      return () => {
        cancelAnimationFrame(raf);
      };
    }, [domReady, state.mounted, state.contentElement]);

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
            position: state.fixed ? "fixed" : "absolute",
            top: 0,
            left: 0,
            ...wrapperProps?.style,
          }}
          ref={popoverRef}
        >
          {element}
        </div>
      ),
      [state.fixed, popoverRef, wrapperProps]
    );

    props = useWrapElement(
      props,
      (element) => (
        <PopoverContext.Provider value={state}>
          {element}
        </PopoverContext.Provider>
      ),
      [state]
    );

    props = {
      ...props,
      style: {
        position: "relative",
        ...props.style,
      },
    };

    props = useDialog({
      state,
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
 * const popover = usePopoverState();
 * <PopoverDisclosure state={popover}>Disclosure</PopoverDisclosure>
 * <Popover state={popover}>Popover</Popover>
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
  "state"
> & {
  /**
   * Object returned by the `usePopoverState` hook.
   */
  state: PopoverState;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
};

export type PopoverProps<T extends As = "div"> = Props<PopoverOptions<T>>;
