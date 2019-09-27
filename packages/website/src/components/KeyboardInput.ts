import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";
import { usePalette, useDarken } from "reakit-system-palette/utils";

export type KeyboardInputOptions = BoxOptions;
export type KeyboardInputHTMLProps = BoxHTMLProps;
export type KeyboardInputProps = KeyboardInputOptions & KeyboardInputHTMLProps;

export const useKeyboardInput = createHook<
  KeyboardInputOptions,
  KeyboardInputHTMLProps
>({
  name: "KeyboardInput",
  compose: useBox,

  useProps(_, htmlProps) {
    const background = usePalette("background");
    const backgroundColor = useDarken(background, 0.08);
    const borderColor = useDarken(backgroundColor, 0.15);
    const keyboardInput = css`
      border-radius: 0.25em;
      font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;
      background-color: ${backgroundColor};
      padding: 0.3em 0.5em 0.25em;
      border: 1px solid ${borderColor};
      border-width: 1px 1px 2px 1px;
      font-size: 0.875em;
    `;
    return {
      ...htmlProps,
      className: cx(keyboardInput, htmlProps.className)
    };
  }
});

const KeyboardInput = createComponent({
  as: "kbd",
  useHook: useKeyboardInput
});

export default KeyboardInput;
