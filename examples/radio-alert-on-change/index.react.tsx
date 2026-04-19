import * as Ariakit from "@ariakit/react";
import type { ElementRef } from "react";
import { forwardRef } from "react";

const Radio = forwardRef<ElementRef<typeof Ariakit.Radio>, Ariakit.RadioProps>(
  function Radio(props, ref) {
    return (
      <Ariakit.Radio
        {...props}
        ref={ref}
        onChange={(event) => {
          props.onChange?.(event);
          alert("changed");
        }}
      />
    );
  },
);

export default function Example() {
  return (
    <>
      <Ariakit.RadioProvider>
        <Ariakit.RadioGroup aria-label="Native">
          <label className="label">
            <Radio value="apple" />
            apple
          </label>
          <label className="label">
            <Radio value="orange" />
            orange
          </label>
          <label className="label">
            <Radio value="watermelon" />
            watermelon
          </label>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <Ariakit.RadioProvider>
        <Ariakit.RadioGroup aria-label="Custom">
          <Radio render={<button />} value="apple">
            apple
          </Radio>
          <Radio render={<button />} value="orange">
            orange
          </Radio>
          <Radio render={<button />} value="watermelon">
            watermelon
          </Radio>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
    </>
  );
}
