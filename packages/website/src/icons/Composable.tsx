import * as React from "react";

function Composable(
  props: React.SVGAttributes<SVGElement>,
  ref: React.Ref<any>
) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 48 48" {...props} ref={ref}>
      <path
        fill="#B0BEC5"
        d="M39,16h-7V9h1V7H8v1H7v25h2v-1h7v7v2h2h21h2v-2V18v-2H39z M9,9h21v21H9V9z M39,39H18v-7h12v1h2v-1h1v-2h-1
	V18h7V39z"
      />
      <path
        fill="#2196F3"
        d="M20,43h-6v-6h6V43z M43,20h-6v-6h6V20z M43,43h-6v-6h6V43z M11,11H5V5h6V11z M11,34H5v-6h6V34z M34,11h-6V5
	h6V11z M34,34h-6v-6h6V34z"
      />
    </svg>
  );
}

export default React.forwardRef(Composable);
