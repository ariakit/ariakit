import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { warning } from "reakit-warning";
import {
  DisclosureOptions,
  DisclosureHTMLProps,
  useDisclosure,
} from "../Disclosure/Disclosure";
import { useDialogState, DialogStateReturn } from "./DialogState";

export type DialogDisclosureOptions = DisclosureOptions &
  Pick<Partial<DialogStateReturn>, "unstable_disclosureRef"> &
  Pick<DialogStateReturn, "toggle">;

export type DialogDisclosureHTMLProps = DisclosureHTMLProps;

export type DialogDisclosureProps = DialogDisclosureOptions &
  DialogDisclosureHTMLProps;

export const useDialogDisclosure = createHook<
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps
>({
  name: "DialogDisclosure",
  compose: useDisclosure,
  useState: useDialogState,

  useProps(options, { ref: htmlRef, onClick: htmlOnClick, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const [expanded, setExpanded] = React.useState(false);
    const disclosureRef = options.unstable_disclosureRef;

    // aria-expanded may be used for styling purposes, so we useLayoutEffect
    useIsomorphicEffect(() => {
      const self = ref.current;
      warning(
        !self,
        "Can't determine whether the element is the current disclosure because `ref` wasn't passed to the component",
        "See https://reakit.io/docs/dialog"
      );
      if (disclosureRef && !disclosureRef.current) {
        disclosureRef.current = self;
      }
      const isCurrentDisclosure =
        !disclosureRef?.current || disclosureRef.current === self;
      setExpanded(!!options.visible && isCurrentDisclosure);
    }, [options.visible, disclosureRef]);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        htmlOnClick?.(event);
        if (event.defaultPrevented) return;
        if (disclosureRef) {
          disclosureRef.current = event.currentTarget;
        }
      },
      [disclosureRef, htmlOnClick]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      "aria-haspopup": "dialog",
      "aria-expanded": expanded,
      onClick,
      ...htmlProps,
    };
  },
});

export const DialogDisclosure = createComponent({
  as: "button",
  memo: true,
  useHook: useDialogDisclosure,
});
