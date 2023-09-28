import type { SVGAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface BellProps extends SVGAttributes<SVGSVGElement> {
  filled?: boolean;
}

export function Bell({ filled, ...props }: BellProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeWidth={filled ? 0 : 1.5}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      {...props}
      className={twMerge("h-5 w-5", props.className)}
    >
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      )}
    </svg>
  );
}
