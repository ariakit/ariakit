import { ComponentType, LazyExoticComponent } from "react";
// @ts-ignore
import examples from "../.pages/examples.js";

export default examples as Record<
  string,
  LazyExoticComponent<ComponentType<any>>
>;
