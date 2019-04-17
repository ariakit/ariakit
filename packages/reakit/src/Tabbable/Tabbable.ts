import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { useLiveRef } from "../__utils/useLiveRef";
import { Keys } from "../__utils/types";

export type TabbableOptions = BoxOptions & {
  /**
   * Same as the HTML attribute.
   */
  disabled?: boolean;
  /**
   * When an element is `disabled`, it may still be `focusable`. It works
   * similarly to `readOnly` on form elements. In this case, only
   * `aria-disabled` will be set.
   */
  focusable?: boolean;
  /**
   * Keyboard keys to trigger click.
   * @private
   */
  unstable_clickKeys?: string[];
};

export type TabbableProps = BoxProps & {
  disabled?: boolean;
};

function isNativeTabbable(element: EventTarget) {
  if (element instanceof HTMLButtonElement) return true;
  if (element instanceof HTMLInputElement) return true;
  if (element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLAnchorElement) return true;
  if (element instanceof HTMLAudioElement) return true;
  if (element instanceof HTMLVideoElement) return true;
  return false;
}

export function useTabbable(
  { unstable_clickKeys = [" "], ...options }: TabbableOptions = {},
  {
    tabIndex = 0,
    onClick,
    onMouseOver,
    onMouseDown,
    disabled,
    ...htmlProps
  }: TabbableProps = {}
) {
  let _options: TabbableOptions = {
    unstable_clickKeys,
    disabled,
    ...options
  };
  _options = unstable_useOptions("Tabbable", _options, htmlProps);

  const clickKeysRef = useLiveRef(_options.unstable_clickKeys);
  const reallyDisabled = _options.disabled && !_options.focusable;

  htmlProps = mergeProps(
    {
      disabled: reallyDisabled,
      tabIndex: reallyDisabled ? undefined : tabIndex,
      "aria-disabled": _options.disabled,
      onMouseDown: event => {
        event.preventDefault();
        if (_options.disabled) {
          event.stopPropagation();
        } else {
          (event.target as HTMLElement).focus();
          if (onMouseDown) {
            onMouseDown(event);
          }
        }
      },
      onClick: event => {
        if (_options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (onClick) {
          onClick(event);
        }
      },
      onMouseOver: event => {
        if (_options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (onMouseOver) {
          onMouseOver(event);
        }
      },
      onKeyDown: event => {
        if (isNativeTabbable(event.target) || _options.disabled) return;

        if (
          clickKeysRef.current &&
          clickKeysRef.current.indexOf(event.key) !== -1
        ) {
          event.preventDefault();
          event.target.dispatchEvent(
            new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            })
          );
        }
      }
    } as TabbableProps,
    htmlProps
  );

  htmlProps = unstable_useProps("Tabbable", _options, htmlProps);
  htmlProps = useBox(_options, htmlProps);
  return htmlProps;
}

const keys: Keys<TabbableOptions> = [
  ...useBox.__keys,
  "disabled",
  "focusable",
  "unstable_clickKeys"
];

useTabbable.__keys = keys;

export const Tabbable = unstable_createComponent({
  as: "button",
  useHook: useTabbable
});
