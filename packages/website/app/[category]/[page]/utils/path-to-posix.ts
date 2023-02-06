export function pathToPosix(path: string) {
  return path.replace(/\\/g, "/");
}
