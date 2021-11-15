import { css } from "@emotion/css";
import { AnyObject } from "ariakit-utils/types";

const CSS_EXPORT = Symbol("css");

export function getCSSModule(module: AnyObject) {
  return module[CSS_EXPORT];
}

export function createCSSModule(code: string) {
  return { [CSS_EXPORT]: css(code) };
}
