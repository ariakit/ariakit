import * as React from "react";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_useId } from "../utils/useId";
import { useUpdateEffect } from "../__utils/useUpdateEffect";
import { createOnKeyDown } from "../__utils/createOnKeyDown";
import { warning } from "../__utils/warning";
import { unstable_createHook } from "../utils/createHook";
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

export type RoverHTMLProps = TabbableHTMLProps;

export type RoverProps = RoverOptions & RoverHTMLProps;

export const useRover = unstable_createHook<RoverOptions, RoverHTMLProps>({
  name: "Rover",
  compose: useTabbable,
  useState: useRoverState,
  keys: ["stopId"],

  useProps(options, { tabIndex, onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const id = unstable_useId("rover-");
    const stopId = options.stopId || htmlProps.id || id;

    const trulyDisabled = options.disabled && !options.focusable;
    const noFocused = options.currentId == null;
    const focused = options.currentId === stopId;
    const isFirst = options.stops[0] && options.stops[0].id === stopId;
    const shouldTabIndex = focused || (isFirst && noFocused);

    React.useEffect(() => {
      if (trulyDisabled) return undefined;
      options.register(stopId, ref);
      return () => options.unregister(stopId);
    }, [stopId, trulyDisabled, options.register, options.unregister]);

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

    const onFocus = React.useCallback(() => options.move(stopId), [
      options.move,
      stopId
    ]);

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
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
        }),
      [
        htmlOnKeyDown,
        options.orientation,
        options.previous,
        options.next,
        options.first,
        options.last
      ]
    );

    return unstable_mergeProps(
      {
        ref,
        id: stopId,
        tabIndex: shouldTabIndex ? tabIndex : -1,
        onFocus,
        onKeyDown
      } as RoverHTMLProps,
      htmlProps
    );
  }
});

export const Rover = unstable_createComponent({
  as: "button",
  useHook: useRover
});
