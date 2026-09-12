import type { ReactNode } from "react";
import { Children } from "react";

/** Wraps text-only children while keeping images and SVGs in their slot. */
export function wrapTextChildren(children: ReactNode) {
  const childArray = Children.toArray(children);
  if (!childArray.length) return children;
  const textOnly = childArray.every(
    (child) =>
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "bigint",
  );
  if (!textOnly) return childArray;
  return <span>{childArray}</span>;
}
