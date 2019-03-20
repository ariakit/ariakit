import * as React from "react";
import { useUpdateEffect } from "../__utils/useUpdateEffect";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useRoverState, unstable_RoverStateReturn } from "./RoverState";
import { unstable_useId } from "../utils";

export type unstable_RoverOptions = unstable_ButtonOptions &
  Partial<unstable_RoverStateReturn> &
  Pick<
    unstable_RoverStateReturn,
    | "stops"
    | "currentId"
    | "pastId"
    | "register"
    | "unregister"
    | "move"
    | "next"
    | "previous"
    | "first"
    | "last"
  > & {
    /** TODO: Descriptions */
    stopId?: string;
  };

export type unstable_RoverProps = unstable_ButtonProps;

export function useRover(
  options: unstable_RoverOptions,
  htmlProps: unstable_RoverProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const id = unstable_useId("rover-");
  const stopId = options.stopId || id;

  const reallyDisabled = options.disabled && !options.focusable;
  const noFocused = options.currentId == null;
  const focused = options.currentId === stopId;
  const isFirst = options.stops[0] && options.stops[0].id === stopId;
  const shouldTabIndexZero = focused || (isFirst && noFocused);

  React.useEffect(() => {
    if (reallyDisabled) return undefined;
    options.register(stopId, ref);
    return () => options.unregister(stopId);
  }, [stopId, reallyDisabled, options.register, options.unregister]);

  useUpdateEffect(() => {
    if (ref.current && focused) {
      ref.current.focus();
    }
  }, [options.pastId, focused]);

  htmlProps = mergeProps(
    {
      ref,
      id: stopId,
      tabIndex: shouldTabIndexZero ? 0 : -1,
      onFocus: () => options.move(stopId),
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
          const key = e.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (action) {
            e.preventDefault();
            action();
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = useHook("useRover", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RoverOptions> = [
  ...useButton.keys,
  ...useRoverState.keys,
  "stopId"
];

useRover.keys = keys;

export const Rover = unstable_createComponent("button", useRover);
