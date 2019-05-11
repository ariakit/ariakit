import * as React from "react";

export type LogoProps = React.SVGAttributes<SVGElement> & {
  colored?: boolean;
};

export default function Symbol({ colored, ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 120 120" height={20} {...props}>
      <defs>
        <linearGradient
          id="Default_gradient"
          y1="89.43"
          x2="119.65"
          y2="89.43"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d060ff" />
          <stop offset="0.7" stopColor="#7b60ff" />
          <stop offset="1" stopColor="#7860ff" />
        </linearGradient>
      </defs>
      <g fill={colored ? "url(#Default_gradient)" : "currentColor"}>
        <polygon points="0 59.5 59.8 119.3 119.7 119.3 60.3 59.5 0 59.5" />
        <path d="M90.8,59.5h0A29.4,29.4,0,0,0,90.8.7H0L60.3,59.5Z" />
      </g>
    </svg>
  );
}
