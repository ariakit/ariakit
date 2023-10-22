import type { SVGAttributes } from "react";
import { twMerge } from "tailwind-merge";

export function ChevronRight(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
      className={twMerge("h-6 w-6", props.className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
