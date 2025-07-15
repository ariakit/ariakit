import type { ReactNode } from "react";

interface InlineFragmentProps {
  children?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function InlineFragment({
  children,
  iconLeft,
  iconRight,
}: InlineFragmentProps) {
  return (
    <>
      {iconLeft && (
        <span className="whitespace-nowrap me-[0.25em] select-none">
          {iconLeft}&#x2060;
        </span>
      )}
      {children}
      {iconRight && (
        <span className="whitespace-nowrap ms-[0.25em] select-none">
          &#x2060;{iconRight}
        </span>
      )}
    </>
  );
}
