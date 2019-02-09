import { RenderProp } from "./types";

function isRenderProp(children: any): children is RenderProp {
  return typeof children === "function";
}

export default isRenderProp;
