import * as React from "react";

function Customizable(
  props: React.SVGAttributes<SVGElement>,
  ref: React.Ref<any>
) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 48 48" {...props} ref={ref}>
      <path
        fill="#CFD8DC"
        d="M42,26H6v-4h36V26z M42,8H6v4h36V8z M42,36H6v4h36V36z"
      />
      <path
        fill="#FF6D00"
        d="M18,12H6V8h12V12z M14,36H6v4h8V36z M31,22H6v4h25V22z"
      />
      <path
        fill="#BF360C"
        d="M20,14h-3c-0.5,0-1-0.4-1-1V7c0-0.6,0.5-1,1-1h3c0.5,0,1,0.4,1,1v6C21,13.6,20.5,14,20,14z M17,41v-6
	c0-0.5-0.5-1-1-1h-3c-0.6,0-1,0.5-1,1v6c0,0.5,0.4,1,1,1h3C16.5,42,17,41.5,17,41z M34,27v-6c0-0.5-0.5-1-1-1h-3c-0.5,0-1,0.5-1,1v6
	c0,0.5,0.5,1,1,1h3C33.5,28,34,27.5,34,27z"
      />
    </svg>
  );
}

export default React.forwardRef(Customizable);
