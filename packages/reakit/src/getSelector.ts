import { ReactType, ComponentClass } from "react";
import { UseComponent } from "reuse";

interface StyledComponentClass extends ComponentClass {
  styledComponentId: string;
}

function hasStyledComponentId(comp: any): comp is StyledComponentClass {
  return comp && typeof comp.styledComponentId === "string";
}

function hasUses<T extends ReactType>(comp: any): comp is UseComponent<T> {
  return comp && Array.isArray(comp.uses);
}

function getSelector(comp: ReactType): string {
  if (hasStyledComponentId(comp)) {
    return `.${comp.styledComponentId}`;
  }
  if (hasUses(comp)) {
    const [first] = comp.uses;
    return getSelector(first);
  }
  throw new Error("Component doesn't have selector");
}

export default getSelector;
