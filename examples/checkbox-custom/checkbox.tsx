import { forwardRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as Ariakit from "@ariakit/react";

interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  children?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ children, ...props }, ref) {
    const [checked, setChecked] = useState(props.defaultChecked ?? false);
    const [focusVisible, setFocusVisible] = useState(false);
    return (
      <label
        className="checkbox"
        data-checked={checked}
        data-focus-visible={focusVisible || undefined}
      >
        <Ariakit.VisuallyHidden>
          <Ariakit.Checkbox
            {...props}
            ref={ref}
            clickOnEnter
            onFocusVisible={() => setFocusVisible(true)}
            onBlur={() => setFocusVisible(false)}
            onChange={(event) => {
              setChecked(event.target.checked);
              props.onChange?.(event);
            }}
          />
        </Ariakit.VisuallyHidden>
        <div className="check" data-checked={checked}>
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 16 16"
            height="1em"
            width="1em"
          >
            <polyline points="4,8 7,12 12,4" />
          </svg>
        </div>
        {children}
      </label>
    );
  },
);
