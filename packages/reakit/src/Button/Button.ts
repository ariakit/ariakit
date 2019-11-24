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
    const [type, setType] = React.useState<"button" | undefined>("button");

    React.useEffect(() => {
      const self = ref.current;
      const isNativeButton =
        self instanceof HTMLButtonElement || self instanceof HTMLInputElement;
      if (!isNativeButton) {
        if (!(self instanceof HTMLAnchorElement)) {
          setRole("button");
        }
        setType(undefined);
      }
    }, []);

    return {
      ref: mergeRefs(ref, htmlRef),
      role,
      type,
      ...htmlProps
    };
  }
});

export const Button = createComponent({
  as: "button",
  useHook: useButton
});
