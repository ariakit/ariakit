import * as React from "react";

function forwardRef<T extends React.RefForwardingComponent<any, any>>(
  component: T
) {
  return (React.forwardRef(component) as unknown) as T;
}

export default forwardRef;
