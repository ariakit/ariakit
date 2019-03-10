import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useRovingState, unstable_RovingStateReturn } from "./RovingState";

export type unstable_RovingOptions = unstable_ButtonOptions &
  Partial<unstable_RovingStateReturn> &
  Pick<
    unstable_RovingStateReturn,
    | "refs"
    | "selectedRef"
    | "focusedRef"
    | "getFirstRef"
    | "register"
    | "unregister"
    | "select"
    | "focus"
    | "focusNext"
    | "focusPrevious"
    | "focusFirst"
    | "focusLast"
  > & {
    /** TODO: Description */
    refId?: string;
  };

export type unstable_RovingProps = unstable_ButtonProps;

export function useRoving(
  options: unstable_RovingOptions,
  htmlProps: unstable_RovingProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const refId = options.refId || ref;
  const focused = options.focusedRef === refId;
  const selected = options.selectedRef === refId;
  const isFirst = options.getFirstRef() === refId;
  const noFocused = options.focusedRef == null;
  const noSelected = options.selectedRef == null;
  const shouldTabIndexZero =
    focused || (selected && noFocused) || (isFirst && noFocused && noSelected);

  React.useEffect(() => {
    options.register(refId, options.disabled);
    return () => options.unregister(refId);
  }, [refId, options.disabled, options.register, options.unregister]);

  React.useEffect(() => {
    if (ref.current && focused) {
      ref.current.focus();
    }
  }, [focused]);

  htmlProps = mergeProps(
    {
      ref,
      tabIndex: shouldTabIndexZero ? 0 : -1,
      onClick: () => options.select(refId),
      onFocus: () => options.focus(refId),
      onKeyDown: e => {
        const keyMap = {
          ArrowUp: options.focusPrevious,
          ArrowRight: options.focusNext,
          ArrowDown: options.focusNext,
          ArrowLeft: options.focusPrevious,
          Home: options.focusFirst,
          End: options.focusLast,
          PageUp: options.focusFirst,
          PageDown: options.focusLast
        };
        if (e.key in keyMap) {
          e.preventDefault();
          keyMap[e.key as keyof typeof keyMap]();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useRoving", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RovingOptions> = [
  ...useButton.keys,
  ...useRovingState.keys,
  "refId"
];

useRoving.keys = keys;

export const Roving = unstable_createComponent("button", useRoving);
