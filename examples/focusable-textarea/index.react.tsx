import type { FocusableProps } from "@ariakit/react";
import { Focusable, Role } from "@ariakit/react";
import * as React from "react";
import "./style.css";

interface TextareaProps extends FocusableProps<"textarea"> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    return (
      <Role.textarea
        {...props}
        ref={ref}
        render={<Focusable render={props.render || <textarea />} />}
      />
    );
  },
);

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
