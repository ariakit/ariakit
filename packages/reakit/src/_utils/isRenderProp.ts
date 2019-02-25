import { RenderProp } from "./types";

export function isRenderProp(children: any): children is RenderProp {
  return typeof children === "function";
}
