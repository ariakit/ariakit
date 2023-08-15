import type { SVGAttributes } from "react";

export function Substack(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="#E66D33"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      {...props}
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}
