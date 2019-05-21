import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createHook } from "../utils/createHook";
import { mergeRefs } from "../__utils/mergeRefs";

export type ButtonOptions = TabbableOptions;

export type ButtonHTMLProps = TabbableHTMLProps &
  React.ButtonHTMLAttributes<any>;

export type ButtonProps = ButtonOptions & ButtonHTMLProps;

export const useButton = unstable_createHook<ButtonOptions, ButtonHTMLProps>({
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

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
