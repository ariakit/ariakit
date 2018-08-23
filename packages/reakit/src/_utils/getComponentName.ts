import { ComponentType } from "react";

function getComponentName<P>(
  component: ComponentType<P> | keyof JSX.IntrinsicElements
) {
  if (typeof component === "string") {
    return component;
  }
  return component.displayName || component.name;
}

export default getComponentName;
