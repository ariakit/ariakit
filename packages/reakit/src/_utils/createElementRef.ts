/* eslint-disable no-param-reassign */
import * as React from "react";

function createElementRef<T extends React.Component<any>>(
  scope: T,
  property: keyof T
) {
  return (element: any) => {
    scope[property] = element;
    if (scope.props && scope.props.elementRef) {
      scope.props.elementRef(element);
    }
  };
}

export default createElementRef;
