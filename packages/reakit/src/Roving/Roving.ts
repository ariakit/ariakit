import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useRovingState, unstable_RovingStateReturn } from "./RovingState";

export type unstable_RovingOptions = unstable_BoxOptions &
  Partial<unstable_RovingStateReturn> &
  Pick<
    unstable_RovingStateReturn,
    | "refs"
    | "currentRef"
    | "register"
    | "unregister"
    | "select"
    | "next"
    | "previous"
    | "first"
    | "last"
  > & {
    /** TODO: Description */
    disabled?: boolean;
  };

export type unstable_RovingProps = unstable_BoxProps;

export function useRoving(
  options: unstable_RovingOptions,
  htmlProps: unstable_RovingProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const active = options.currentRef === ref;

  React.useEffect(() => {
    options.register(ref, options.disabled);
    return () => options.unregister(ref);
  }, [options.disabled, options.register, options.unregister]);

  React.useEffect(() => {
    if (active && ref.current) {
      ref.current.focus();
    }
  }, [active]);

  const select = React.useCallback(() => {
    options.select(ref);
  }, [options.select]);

  htmlProps = mergeProps(
    {
      ref,
      onClick: select,
      onFocus: select,
      onKeyDown: e => {
        const keyMap = {
          ArrowUp: options.previous,
          ArrowRight: options.next,
          ArrowDown: options.next,
          ArrowLeft: options.previous,
          Home: options.first,
          End: options.last,
          PageUp: options.first,
          PageDown: options.last
        };
        if (e.key in keyMap) {
          e.preventDefault();
          keyMap[e.key as keyof typeof keyMap]();
        }
      }
    } as typeof htmlProps,
    options.disabled
      ? { disabled: options.disabled }
      : { tabIndex: active ? 0 : -1 },
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useRoving", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RovingOptions> = [
  ...useBox.keys,
  ...useRovingState.keys,
  "disabled"
];

useRoving.keys = keys;

export const Roving = unstable_createComponent("div", useRoving);
