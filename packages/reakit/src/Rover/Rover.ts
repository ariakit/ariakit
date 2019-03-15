import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useRoverState, unstable_RoverStateReturn } from "./RoverState";

export type unstable_RoverOptions = unstable_ButtonOptions &
  Partial<unstable_RoverStateReturn> &
  Pick<
    unstable_RoverStateReturn,
    | "refs"
    | "activeRef"
    | "lastActiveRef"
    | "getFirst"
    | "register"
    | "unregister"
    | "moveTo"
    | "next"
    | "previous"
    | "first"
    | "last"
  > & {
    /** TODO: Description */
    refId?: string;
  };

export type unstable_RoverProps = unstable_ButtonProps;

export function useRover(
  options: unstable_RoverOptions,
  htmlProps: unstable_RoverProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const refId = options.refId || ref;
  const reallyDisabled = options.disabled && !options.focusable;
  const noFocused = options.activeRef == null;
  const focused = options.activeRef === refId;
  const isFirst = options.getFirst() === refId;
  const shouldTabIndexZero = focused || (isFirst && noFocused);

  React.useEffect(() => {
    options.register(refId, reallyDisabled);
    return () => options.unregister(refId);
  }, [refId, reallyDisabled, options.register, options.unregister]);

  React.useEffect(() => {
    if (ref.current && options.lastActiveRef && focused) {
      ref.current.focus();
    }
  }, [options.lastActiveRef, focused]);

  htmlProps = mergeProps(
    {
      ref,
      tabIndex: shouldTabIndexZero ? 0 : -1,
      onFocus: () => options.moveTo(refId),
      onKeyDown: e => {
        const { orientation } = options;
        const keyMap = {
          ArrowUp: orientation !== "horizontal" && options.previous,
          ArrowRight: orientation !== "vertical" && options.next,
          ArrowDown: orientation !== "horizontal" && options.next,
          ArrowLeft: orientation !== "vertical" && options.previous,
          Home: options.first,
          End: options.last,
          PageUp: options.first,
          PageDown: options.last
        };
        if (e.key in keyMap) {
          e.preventDefault();
          const key = e.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (action) {
            action();
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useHook("useRover", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RoverOptions> = [
  ...useButton.keys,
  ...useRoverState.keys,
  "refId"
];

useRover.keys = keys;

export const Rover = unstable_createComponent("button", useRover);
