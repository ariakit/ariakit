import * as React from "react";
import {
  TabbableOptions,
  TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useId } from "../utils/useId";
import { useUpdateEffect } from "../__utils/useUpdateEffect";
import { Keys } from "../__utils/types";
import { createOnKeyDown } from "../__utils/createOnKeyDown";
import { warning } from "../__utils/warning";
import { RoverStateReturn, useRoverState } from "./RoverState";

export type RoverOptions = TabbableOptions &
  Pick<Partial<RoverStateReturn>, "orientation"> &
  Pick<
    RoverStateReturn,
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
    /**
     * Element ID.
     */
    stopId?: string;
  };

export type RoverProps = TabbableProps;

export function useRover(
  options: RoverOptions,
  { tabIndex, onKeyDown, ...htmlProps }: RoverProps = {}
) {
  options = unstable_useOptions("Rover", options, htmlProps);

  const ref = React.useRef<HTMLElement>(null);
  const id = unstable_useId("rover-");
  const stopId = options.stopId || htmlProps.id || id;

  const reallyDisabled = options.disabled && !options.focusable;
  const noFocused = options.currentId == null;
  const focused = options.currentId === stopId;
  const isFirst = options.stops[0] && options.stops[0].id === stopId;
  const shouldTabIndex = focused || (isFirst && noFocused);

  React.useEffect(() => {
    if (reallyDisabled) return undefined;
    options.register(stopId, ref);
    return () => options.unregister(stopId);
  }, [stopId, reallyDisabled, options.register, options.unregister]);

  useUpdateEffect(() => {
    if (!ref.current) {
      warning(
        true,
        "Can't focus rover component because either `ref` wasn't passed to component or the component wasn't rendered. See https://reakit.io/docs/rover",
        "Rover"
      );
      return;
    }
    if (focused) {
      ref.current.focus();
    }
  }, [focused]);

  htmlProps = mergeProps(
    {
      ref,
      id: stopId,
      tabIndex: shouldTabIndex ? tabIndex : -1,
      onFocus: () => options.move(stopId),
      onKeyDown: createOnKeyDown({
        onKeyDown,
        keyMap: {
          ArrowUp: options.orientation !== "horizontal" && options.previous,
          ArrowRight: options.orientation !== "vertical" && options.next,
          ArrowDown: options.orientation !== "horizontal" && options.next,
          ArrowLeft: options.orientation !== "vertical" && options.previous,
          Home: options.first,
          End: options.last,
          PageUp: options.first,
          PageDown: options.last
        }
      })
    } as RoverProps,
    htmlProps
  );

  htmlProps = unstable_useProps("Rover", options, htmlProps);
  htmlProps = useTabbable(options, htmlProps);
  return htmlProps;
}

const keys: Keys<RoverStateReturn & RoverOptions> = [
  ...useTabbable.__keys,
  ...useRoverState.__keys,
  "stopId"
];

useRover.__keys = keys;

export const Rover = unstable_createComponent({
  as: "button",
  useHook: useRover
});
