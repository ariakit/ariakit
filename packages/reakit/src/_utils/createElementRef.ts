/* eslint-disable no-param-reassign */
import * as React from "react";

const createElementRef = (scope: any, property: string) => (
  element: React.ReactNode | HTMLElement
) => {
  scope[property] = element;
  if (scope.props && scope.props.elementRef) {
    scope.props.elementRef(element);
  }
};

export default createElementRef;
