import type { FocusableProps } from "@ariakit/react";
import { Focusable, Role } from "@ariakit/react";
import { forwardRef } from "react";

interface TextareaProps extends FocusableProps<"textarea"> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
    <label>
      Comment
      <Textarea placeholder="Write your comment, be kind" />
    </label>
  );
}
