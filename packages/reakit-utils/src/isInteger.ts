export function isInteger(obj: any) {
  if (typeof obj === "number") {
    return Math.floor(obj) === obj;
  }
  return String(Math.floor(Number(obj))) === obj;
}
