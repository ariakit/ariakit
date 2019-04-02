import * as React from "react";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useId } from "../utils/useId";
import { useUpdateEffect } from "../__utils/useUpdateEffect";
import { Keys } from "../__utils/types";
import { unstable_RoverStateReturn, useRoverState } from "./RoverState";

export type unstable_RoverOptions = unstable_TabbableOptions &
  Partial<unstable_RoverStateReturn> &
  Pick<
    unstable_RoverStateReturn,
    | "unstable_stops"
    | "unstable_currentId"
    | "unstable_register"
    | "unstable_unregister"
    | "unstable_move"
    | "unstable_next"
    | "unstable_previous"
    | "unstable_first"
    | "unstable_last"
  > & {
    /**
     * Element ID.
     */
    stopId?: string;
  };

export type unstable_RoverProps = unstable_TabbableProps;

export function useRover(
  options: unstable_RoverOptions,
  { tabIndex, ...htmlProps }: unstable_RoverProps = {}
) {
  options = unstable_useOptions("useRover", options, htmlProps);

  const ref = React.useRef<HTMLElement>(null);
  const id = unstable_useId("rover-");
  const stopId = options.stopId || id;

  const reallyDisabled = options.disabled && !options.unstable_focusable;
  const noFocused = options.unstable_currentId == null;
  const focused = options.unstable_currentId === stopId;
  const isFirst =
    options.unstable_stops[0] && options.unstable_stops[0].id === stopId;
  const shouldTabIndex = focused || (isFirst && noFocused);

  React.useEffect(() => {
    if (reallyDisabled) return undefined;
    options.unstable_register(stopId, ref);
    return () => options.unstable_unregister(stopId);
  }, [
    stopId,
    reallyDisabled,
    options.unstable_register,
    options.unstable_unregister
  ]);

  useUpdateEffect(() => {
    if (ref.current && focused) {
      ref.current.focus();
    }
  }, [focused]);

  htmlProps = mergeProps(
    {
      ref,
      id: stopId,
      tabIndex: shouldTabIndex ? tabIndex : -1,
      onFocus: () => options.unstable_move(stopId),
      onKeyDown: event => {
        const { orientation } = options;
        const keyMap = {
          ArrowUp: orientation !== "horizontal" && options.unstable_previous,
          ArrowRight: orientation !== "vertical" && options.unstable_next,
          ArrowDown: orientation !== "horizontal" && options.unstable_next,
          ArrowLeft: orientation !== "vertical" && options.unstable_previous,
          Home: options.unstable_first,
          End: options.unstable_last,
          PageUp: options.unstable_first,
          PageDown: options.unstable_last
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
  htmlProps = unstable_useProps("useRover", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_RoverOptions> = [
  ...useTabbable.__keys,
  ...useRoverState.__keys,
  "stopId"
];

useRover.__keys = keys;

export const Rover = unstable_createComponent({
  as: "button",
  useHook: useRover
});
