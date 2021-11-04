import { MouseEvent, useCallback, useEffect } from "react";
import { contains } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { useEventCallback, useForkRef } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { HovercardState } from "./hovercard-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a hidden disclosure button that will be visible
 * when the hovercard anchor element (`HovercardAnchor`) receives keyboard
 * focus. The user can then navigate to the button to open the hovercard when
 * using the keyboard.
 * @see https://ariakit.org/docs/hovercard
 * @example
 * ```jsx
 * const state = useHovercardState();
 * const props = useHovercardDisclosure({ state });
 * <HovercardAnchor state={state}>@username</HovercardAnchor>
 * <Role {...props} />
 * <Hovercard state={state}>Details</Hovercard>
 * ```
 */
export const useHovercardDisclosure = createHook<HovercardDisclosureOptions>(
  ({ state, ...props }) => {
    const onClickProp = useEventCallback(props.onClick);

    // Listens to blur events on the whole document and hides the hovercard
    // disclosure if whether the hovercard or the disclosure loses focus. We
    // don't need to listen to blur events on the anchor element because we are
    // already showing the disclosure when the anchor element is focused.
    useEffect(() => {
      if (!state.disclosureVisible) return;
      const onBlur = (event: FocusEvent) => {
        const nextActiveElement = event.relatedTarget as Node | null;
        if (nextActiveElement) {
          const popover = state.popoverRef.current;
          const disclosure = state.disclosureRef.current;
          if (popover && contains(popover, nextActiveElement)) return;
          if (disclosure && contains(disclosure, nextActiveElement)) return;
        }
        state.setDisclosureVisible(false);
      };
      return addGlobalEventListener("focusout", onBlur, true);
    }, [
      state.disclosureVisible,
      state.popoverRef,
      state.disclosureRef,
      state.setDisclosureVisible,
    ]);

    // By default, hovercards don't receive focus when they are shown. When the
    // disclosure element is clicked, though, we want it to behave like a
    // popover, so we set the autoFocusOnShow prop to true.
    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state.setAutoFocusOnShow(true);
      },
      [onClickProp, state.setAutoFocusOnShow]
    );

    const children = (
      <svg
        aria-label="More information"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
      </svg>
    );

    props = {
      hidden: !state.disclosureVisible,
      children,
      ...props,
      ref: useForkRef(state.disclosureRef, props.ref),
      onClick,
    };

    props = useDialogDisclosure({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a hidden disclosure button that will be visible when
 * the hovercard anchor element (`HovercardAnchor`) receives keyboard focus. The
 * user can then navigate to the button to open the hovercard when using the
 * keyboard.
 * @see https://ariakit.org/docs/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardState();
 * <HovercardAnchor state={hovercard}>@username</HovercardAnchor>
 * <HovercardDisclosure state={hovercard} />
 * <Hovercard state={hovercard}>Details</Hovercard>
 * ```
 */
export const HovercardDisclosure = createComponent<HovercardDisclosureOptions>(
  (props) => {
    const htmlProps = useHovercardDisclosure(props);
    return createElement("button", htmlProps);
  }
);

export type HovercardDisclosureOptions<T extends As = "button"> = Omit<
  DialogDisclosureOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useHovercardState` hook.
   */
  state: HovercardState;
};

export type HovercardDisclosureProps<T extends As = "button"> = Props<
  HovercardDisclosureOptions<T>
>;
