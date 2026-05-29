export function tsToJsFilename(filename: string) {
  return filename.replace(/\.ts(x?)$/, ".js$1");
}
