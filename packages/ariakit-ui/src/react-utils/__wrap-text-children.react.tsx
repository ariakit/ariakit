import type { ReactNode } from "react";
import { Children, Fragment, isValidElement } from "react";

function isTextChild(child: ReactNode): boolean {
  if (isValidElement<{ children?: ReactNode }>(child)) {
    if (child.type !== Fragment) return false;
    return Children.toArray(child.props.children).every(isTextChild);
  }
  return (
    typeof child === "string" ||
    typeof child === "number" ||
    typeof child === "bigint"
  );
}

/** Wraps text-only children while keeping images and SVGs in their slot. */
export function wrapTextChildren(children: ReactNode) {
  const childArray = Children.toArray(children);
  if (!childArray.length) {
    return children;
  }
  if (!childArray.every(isTextChild)) {
    return children;
  }
  return <span>{children}</span>;
}
