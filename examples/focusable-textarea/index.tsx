import * as Ariakit from "@ariakit/react";
import * as React from "react";
import "./style.css";

export default function Example() {
  return (
    <label className="label">
      Comment
      <Textarea
        className="textarea"
        placeholder="Write your comment, be kind"
      />
    </label>
  );
}

interface TextareaProps extends Ariakit.FocusableProps<"textarea"> {}

export const Textarea = React.forwardRef<
  React.ElementRef<"textarea">,
  TextareaProps
>((props, forwardedRef) => {
  return (
    <Ariakit.Role.textarea
      {...props}
      ref={forwardedRef}
      render={<Ariakit.Focusable render={props.render || <textarea />} />}
    />
  );
});
