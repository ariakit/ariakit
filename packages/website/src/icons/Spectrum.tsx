import * as React from "react";

function Spectrum(props: React.SVGAttributes<SVGElement>, ref: React.Ref<any>) {
  return (
    <svg height="1em" width="1em" viewBox="0 0 78 78" {...props} ref={ref}>
      <path
        fill="currentColor"
        d="M99.07,118.9c-3.83,0-7.66,0-11.49,0-6.4-.08-7.84-1.56-8-8-.3-14.45-6.43-24.13-19-28.64-4-1.42-8.46-1.57-12.74-1.76-4.58-.2-6.79-2.3-6.82-6.73q-.09-13,0-26c0-4.47,2.44-6.52,6.9-6.74,39.35-2,73.12,31.88,70.94,71.07-.25,4.46-2.39,6.75-6.84,6.79S103.4,118.89,99.07,118.9Z"
        transform="translate(-41.02 -40.94)"
      />
    </svg>
  );
}

export default React.forwardRef(Spectrum);
