import type { ComponentType, LazyExoticComponent } from "react";
// @ts-ignore
import examples from "../.pages/examples.js";

export default examples as unknown as Record<
  string,
  LazyExoticComponent<ComponentType<any>>
>;
