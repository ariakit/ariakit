import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";

export type ButtonOptions = TabbableOptions;

export type ButtonHTMLProps = TabbableHTMLProps &
  React.ButtonHTMLAttributes<any>;

export type ButtonProps = ButtonOptions & ButtonHTMLProps;

export const useButton = createHook<ButtonOptions, ButtonHTMLProps>({
  name: "Button",
  compose: useTabbable,

  useProps(_, { ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const [role, setRole] = React.useState<"button" | undefined>(undefined);

    React.useEffect(() => {
      if (
        ref.current &&
        (ref.current instanceof HTMLButtonElement ||
          ref.current instanceof HTMLAnchorElement ||
          ref.current instanceof HTMLInputElement)
      ) {
        return;
      }
      setRole("button");
    }, []);

    return {
      ref: mergeRefs(ref, htmlRef),
      role,
      type: "button",
      ...htmlProps
    };
  }
});

export const Button = createComponent({
  as: "button",
  useHook: useButton
});
