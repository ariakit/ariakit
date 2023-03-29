import type { SVGAttributes } from "react";

export default function React(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" {...props}>
      <circle
        className="fill-blue-600 dark:fill-[#61dafb]"
        cx="0"
        cy="0"
        r="2.05"
      />
      <g
        className="stroke-blue-600 dark:stroke-[#61dafb]"
        strokeWidth="1"
        fill="none"
      >
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
