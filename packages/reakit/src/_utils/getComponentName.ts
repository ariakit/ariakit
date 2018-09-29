import { ComponentType } from "react";

function getComponentName(
  component: ComponentType<any> | keyof JSX.IntrinsicElements
) {
  if (typeof component === "string") {
    return component;
  }
  return component.displayName || component.name;
}

export default getComponentName;
