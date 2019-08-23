import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useId } from "reakit-utils/useId";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { RoverStateReturn, useRoverState } from "./RoverState";

export type RoverOptions = TabbableOptions &
  Pick<Partial<RoverStateReturn>, "orientation" | "unstable_moves"> &
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

export const useRover = createHook<RoverOptions, RoverHTMLProps>({
  name: "Rover",
  compose: useTabbable,
  useState: useRoverState,
  keys: ["stopId"],

  useProps(
    options,
    {
      ref: htmlRef,
      tabIndex: htmlTabIndex,
      onKeyDown: htmlOnKeyDown,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);
    const id = useId("rover-");
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

    React.useEffect(() => {
      if (!ref.current) {
        warning(
          true,
          "Rover",
          "Can't focus rover component because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/rover"
        );
        return;
      }
      if (options.unstable_moves && focused && !hasFocusWithin(ref.current)) {
        ref.current.focus();
      }
    }, [focused, options.unstable_moves]);

    React.useEffect(() => {
      if (!ref.current) return undefined;

      const onFocus = () => options.move(stopId);

      // https://github.com/facebook/react/issues/11387#issuecomment-524113945
      ref.current.addEventListener("focus", onFocus, true);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener("focus", onFocus, true);
        }
      };
    }, [options.move, stopId]);

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: true,
          // Ignore portals
          shouldKeyDown: event =>
            // https://github.com/facebook/react/issues/11387
            event.currentTarget.contains(event.target as Node),
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

    return {
      ref: mergeRefs(ref, htmlRef),
      id: stopId,
      tabIndex: shouldTabIndex ? htmlTabIndex : -1,
      onKeyDown,
      ...htmlProps
    };
  }
});

export const Rover = createComponent({
  as: "button",
  useHook: useRover
});
