import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useProps } from "../system/useProps";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";

type KeyMap = {
  [key: string]:
    | ((event: React.KeyboardEvent<any>) => any)
    | null
    | false
    | undefined;
};

export type unstable_KeyBinderOptions = {
  /**
   * TODO: Description
   */
  keyMap?: KeyMap | ((event: React.KeyboardEvent) => KeyMap);
  /**
   * TODO: Description
   */
  onKey?: (event: React.KeyboardEvent) => any;
  /**
   * TODO: Description
   */
  preventDefault?: boolean | ((event: React.KeyboardEvent) => boolean);
  /**
   * TODO: Description
   */
  stopPropagation?: boolean | ((event: React.KeyboardEvent) => boolean);
};

export type unstable_KeyBinderProps = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function unstable_useKeyBinder(
  { preventDefault = true, ...options }: unstable_KeyBinderOptions = {},
  htmlProps: unstable_KeyBinderProps = {}
) {
  let _options: unstable_KeyBinderOptions = { preventDefault, ...options };
  _options = unstable_useOptions("KeyBinder", _options, htmlProps);

  htmlProps = mergeProps(
    {
      onKeyDown: event => {
        if (!_options.keyMap) return;

        const keyMap =
          typeof _options.keyMap === "function"
            ? _options.keyMap(event)
            : _options.keyMap;

        const shouldPreventDefault =
          typeof _options.preventDefault === "function"
            ? _options.preventDefault(event)
            : _options.preventDefault;

        const shouldStopPropagation =
          typeof _options.stopPropagation === "function"
            ? _options.stopPropagation(event)
            : _options.stopPropagation;

        if (event.key in keyMap) {
          const action = keyMap[event.key];
          if (typeof action === "function") {
            if (shouldPreventDefault) event.preventDefault();
            if (shouldStopPropagation) event.stopPropagation();
            if (_options.onKey) _options.onKey(event);
            action(event);
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = unstable_useProps("KeyBinder", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_KeyBinderOptions> = [
  "keyMap",
  "onKey",
  "preventDefault",
  "stopPropagation"
];

unstable_useKeyBinder.__keys = keys;

export const unstable_KeyBinder = unstable_createComponent({
  as: "div",
  useHook: unstable_useKeyBinder
});
