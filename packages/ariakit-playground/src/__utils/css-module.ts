import { css } from "@emotion/css";
import { AnyObject } from "ariakit-utils/types";

const CSS_EXPORT = Symbol("css");

export function getCSSModule(module: AnyObject) {
  return module[CSS_EXPORT];
}

export function createCSSModule(code: string) {
  return {
    [CSS_EXPORT]: css(
      code
        .replace(/\:root/gi, "&")
        .replace(/\.dark(-mode)?\s+/g, ".dark$1 & ")
        .replace(/\.light(-mode)?\s+/g, ".light$1 & ")
    ),
  };
}
