// TODO: Refactor
import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import { unstable_Portal as Portal } from "../portal/Portal";
import { useDialogState, unstable_DialogStateReturn } from "./useDialogState";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../hidden/Hidden";

export type unstable_DialogOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> & {
    /** TODO: Description */
    unstable_focusOnShow?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_focusOnHide?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_hideOnEsc?: boolean;
  };

export type unstable_DialogProps = unstable_HiddenProps;

const tabbableSelector =
  'input, select, textarea, a[href], button, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

export function useDialog(
  { unstable_hideOnEsc = true, ...options }: unstable_DialogOptions = {},
  htmlProps: unstable_DialogProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const activeElementBeforeVisible = React.useRef<HTMLElement | null>(null);
  const [hasFocusable, setHasFocusable] = React.useState(true);

  // stores the active element before focusing dialog
  React.useLayoutEffect(() => {
    if (options.visible) {
      activeElementBeforeVisible.current = document.activeElement as HTMLElement;
    }
  }, [options.visible]);

  // hideOnEsc
  React.useEffect(() => {
    if (!unstable_hideOnEsc) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && options.visible && options.hide) {
        if (ref.current && ref.current.parentNode) {
          const nestedDialogs = ref.current.parentNode.querySelectorAll(
            "[data-hide-on-esc=true][aria-hidden=false]"
          );
          if (nestedDialogs.item(nestedDialogs.length - 1) !== ref.current)
            return;
        }
        // It's necessary so it doesn't hide before the condition above
        window.requestAnimationFrame(() => {
          options.hide!();
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [options.hide, unstable_hideOnEsc, options.visible]);

  // restores focus on the activeElement after closing the dialog
  React.useEffect(() => {
    if (!options.visible) {
      if (
        options.unstable_focusOnHide &&
        options.unstable_focusOnHide.current
      ) {
        options.unstable_focusOnHide.current.focus();
      } else if (activeElementBeforeVisible.current) {
        activeElementBeforeVisible.current.focus();
      }
    }
  }, [options.visible, options.unstable_focusOnHide]);

  // focuses the first tabbable element when the dialog is shown
  React.useEffect(() => {
    if (options.visible) {
      if (
        options.unstable_focusOnShow &&
        options.unstable_focusOnShow.current
      ) {
        options.unstable_focusOnShow.current.focus();
      } else if (ref.current) {
        const tabbable = ref.current.querySelector<HTMLElement>(
          tabbableSelector
        );
        if (tabbable) {
          tabbable.focus();
        } else {
          setHasFocusable(false);
          window.requestAnimationFrame(() => {
            if (ref.current) {
              ref.current.focus();
            }
          });
        }
      }
    }
  }, [options.visible, options.unstable_focusOnShow]);

  // focus trap
  React.useEffect(() => {
    if (options.visible) {
      const handleTab = (e: KeyboardEvent) => {
        if (!ref.current) return;
        if (e.key !== "Tab") return;
        const tabbable = ref.current.querySelectorAll<HTMLElement>(
          tabbableSelector
        );
        const array = Array.from(tabbable);
        let focused = array.find(item => item === document.activeElement);

        if (!options.unstable_modal) {
          if (!focused) {
            // TODO: if activeElementBeforeVisible is document.activeElement
            // focus the first tabbable element on the dialog
            // if focus is on the next tabbable element after activeElementBeforeVisible
            // focus the last tabbable element on the dialog
            return;
          }
          const index = array.indexOf(focused);
          if (index === 0 && e.shiftKey) {
            if (activeElementBeforeVisible.current) {
              e.preventDefault();
              activeElementBeforeVisible.current.focus();
            }
          } else if (index === array.length - 1 && !e.shiftKey) {
            if (activeElementBeforeVisible.current) {
              const allTabbable = document.querySelectorAll<HTMLElement>(
                tabbableSelector
              );
              const i = Array.from(allTabbable).indexOf(
                activeElementBeforeVisible.current
              );
              if (allTabbable[i + 1]) {
                e.preventDefault();
                allTabbable[i + 1].focus();
              }
            }
          }
          return;
        }

        if (!tabbable.length) {
          throw new Error(
            "There should be at least one tabbable element in the modal"
          );
        }

        e.preventDefault();

        if (!focused) {
          const [first] = array;
          first.focus();
          focused = first;
        }
        const index = array.indexOf(focused);
        const next = array.length - 1 > index ? index + 1 : 0;
        const previous = index === 0 ? array.length - 1 : index - 1;
        if (e.shiftKey) {
          array[previous].focus();
        } else {
          array[next].focus();
        }
      };

      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
    return undefined;
  }, [options.visible, options.unstable_modal]);

  htmlProps = mergeProps(
    {
      ref,
      role: "dialog"
    } as typeof htmlProps,
    // necessary for escaping nested dialogs
    unstable_hideOnEsc ? { "data-hide-on-esc": true } : {},
    options.unstable_modal ? { "aria-modal": true } : {},
    hasFocusable ? {} : { tabIndex: 0 },
    htmlProps
  );
  const allOptions = { unstable_hideOnEsc, ...options };
  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = unstable_useHook("useDialog", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogOptions> = [
  ...useHidden.keys,
  ...useDialogState.keys,
  "unstable_focusOnHide",
  "unstable_focusOnShow"
];

useDialog.keys = keys;

export const Dialog = unstable_createComponent(
  "div",
  useDialog,
  // @ts-ignore: TODO typeof createElement
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
