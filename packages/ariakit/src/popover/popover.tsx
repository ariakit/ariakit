import { RefObject, useState } from "react";
import {
  useForkRef,
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
 * @see https://ariakit.org/docs/popover
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
    ...props
  }) => {
    const popoverRef = state.popoverRef as RefObject<HTMLDivElement>;
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const portalRef = useForkRef(setPortalNode, props.portalRef);

    // When the popover is rendered within a portal, we need to wait for the
    // portalNode to be created so we can update the popover position.
    useSafeLayoutEffect(() => {
      if (!portalNode) return;
      if (!state.mounted) return;
      state.render();
    }, [portalNode, state.mounted, state.render]);

    // Wrap our element in a div that will be used to position the popover.
    // This way the user doesn't need to override the popper's position to
    // create animations.
    props = useWrapElement(
      props,
      (element) => (
        // TODO: Receive the element similar to DialogBackdrop? Use same zIndex
        // as popover.
        <div data-popover="" ref={popoverRef}>
          {element}
        </div>
      ),
      [popoverRef]
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

    props = useDialog({
      state,
      modal,
      preserveTabOrder,
      portal,
      ...props,
      portalRef,
    });

    return props;
  }
);

/**
 * A component that renders a popover element.
 * @see https://ariakit.org/docs/popover
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

export type PopoverOptions<T extends As = "div"> = Omit<
  DialogOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `usePopoverState` hook.
   */
  state: PopoverState;
};

export type PopoverProps<T extends As = "div"> = Props<PopoverOptions<T>>;
