import * as React from "react";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useId } from "../utils/useId";
import { useUpdateEffect } from "../__utils/useUpdateEffect";
import { unstable_RoverStateReturn, useRoverState } from "./RoverState";

export type unstable_RoverOptions = unstable_TabbableOptions &
  Partial<unstable_RoverStateReturn> &
  Pick<
    unstable_RoverStateReturn,
    | "stops"
    | "currentId"
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

export type unstable_RoverProps = unstable_TabbableProps;

export function useRover(
  options: unstable_RoverOptions,
  htmlProps: unstable_RoverProps = {}
) {
  const ref = React.useRef<HTMLElement>(null);
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
  }, [focused]);

  htmlProps = mergeProps(
    {
      ref,
      id: stopId,
      tabIndex: shouldTabIndexZero ? 0 : -1,
      onFocus: () => options.move(stopId),
      onKeyDown: event => {
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
        if (event.key in keyMap) {
          const key = event.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (action) {
            event.preventDefault();
            action();
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useTabbable(options, htmlProps);
  htmlProps = useHook("useRover", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RoverOptions> = [
  ...useTabbable.keys,
  ...useRoverState.keys,
  "stopId"
];

useRover.keys = keys;

export const Rover = unstable_createComponent("button", useRover);
