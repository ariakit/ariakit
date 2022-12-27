const CSS_EXPORT = Symbol("css");

export function getCSSModule(module: Record<keyof any, any>) {
  return module[CSS_EXPORT];
}

export function createCSSModule(code: string) {
  return {
    [CSS_EXPORT]: code
      .replace(/\:root/gi, "&")
      .replace(/\.dark(-mode)?\s+/g, ".dark$1 & ")
      .replace(/\.light(-mode)?\s+/g, ".light$1 & "),
  };
}
