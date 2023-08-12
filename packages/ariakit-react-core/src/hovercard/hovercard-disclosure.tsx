import type { MouseEvent, FocusEvent as ReactFocusEvent } from "react";
import { useEffect, useState } from "react";
import { contains } from "@ariakit/core/utils/dom";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { sync } from "@ariakit/core/utils/store";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.js";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.js";
import { useEvent, useMergeRefs } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useVisuallyHidden } from "../visually-hidden/visually-hidden.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardDisclosure` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardDisclosure({ store });
 * <HovercardAnchor store={store}>@username</HovercardAnchor>
 * <Role {...props} />
 * <Hovercard store={store}>Details</Hovercard>
 * ```
 */
export const useHovercardDisclosure = createHook<HovercardDisclosureOptions>(
  ({ store, ...props }) => {
    const [visible, setVisible] = useState(false);

    // Listens to blur events on the whole document and hides the hovercard
    // disclosure if either the hovercard, the anchor or the disclosure button
    // itself loses focus.
    useEffect(() => {
      if (!visible) return;
      const onBlur = (event: FocusEvent) => {
        const nextActiveElement = event.relatedTarget as Element | null;
        if (nextActiveElement) {
          const {
            anchorElement: anchor,
            popoverElement: popover,
            disclosureElement: disclosure,
          } = store.getState();
          if (anchor && contains(anchor, nextActiveElement)) return;
          if (popover && contains(popover, nextActiveElement)) return;
          if (disclosure && contains(disclosure, nextActiveElement)) return;
          // When the portal prop is set to true on the Hovercard component,
          // it's going to render focus trap elements outside of the portal.
          // These elements may transfer focus to the disclosure button, so we
          // also ignore them here.
          if (nextActiveElement.hasAttribute("data-focus-trap")) return;
        }
        setVisible(false);
      };
      return addGlobalEventListener("focusout", onBlur, true);
    }, [visible, store]);

    // Shows the hovercard disclosure when the anchor receives keyboard focus.
    useEffect(() => {
      return sync(
        store,
        (state) => {
          const anchor = state.anchorElement;
          if (!anchor) return;
          const observer = new MutationObserver(() => {
            if (!anchor.hasAttribute("data-focus-visible")) return;
            setVisible(true);
          });
          observer.observe(anchor, { attributeFilter: ["data-focus-visible"] });
          return () => observer.disconnect();
        },
        ["anchorElement"],
      );
    }, [store]);

    const onClickProp = props.onClick;

    // By default, hovercards don't receive focus when they are shown. When the
    // disclosure element is clicked, though, we want it to behave like a
    // popover, so we set the autoFocusOnShow prop to true.
    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store.setAutoFocusOnShow(true);
    });

    const onFocusProp = props.onFocus;

    // Since the disclosure button is only visually hidden, it may receive focus
    // when the user tabs to it. So we make sure it's visible when that happens.
    const onFocus = useEvent((event: ReactFocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      setVisible(true);
    });

    const { style } = useVisuallyHidden();

    if (!visible) {
      props = {
        ...props,
        style: {
          ...style,
          ...props.style,
        },
      };
    }

    const children = (
      <svg
        display="block"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5pt"
        viewBox="0 0 16 16"
        height="1em"
        width="1em"
      >
        <polyline points="4,6 8,10 12,6" />
      </svg>
    );

    props = {
      children,
      ...props,
      ref: useMergeRefs(store.setDisclosureElement, props.ref),
      onClick,
      onFocus,
    };

    props = useDialogDisclosure({ store, ...props });

    return props;
  },
);

/**
 * Renders a hidden disclosure button that will be visible when the hovercard
 * anchor element (`HovercardAnchor`) receives keyboard focus. The user can then
 * navigate to the button to open the hovercard when using the keyboard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore();
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <HovercardDisclosure store={hovercard} />
 * <Hovercard store={hovercard}>Details</Hovercard>
 * ```
 */
export const HovercardDisclosure = createComponent<HovercardDisclosureOptions>(
  (props) => {
    const htmlProps = useHovercardDisclosure(props);
    return createElement("button", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  HovercardDisclosure.displayName = "HovercardDisclosure";
}

export interface HovercardDisclosureOptions<T extends As = "button">
  extends DialogDisclosureOptions<T> {
  /**
   * Object returned by the `useHovercardStore` hook.
   */
  store: HovercardStore;
}

export type HovercardDisclosureProps<T extends As = "button"> = Props<
  HovercardDisclosureOptions<T>
>;
