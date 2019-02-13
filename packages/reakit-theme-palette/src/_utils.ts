export function toArray<T>(arg: T[] | T) {
  return Array.isArray(arg) ? arg : [arg];
}

export function clamp(number: number, min: number, max: number) {
  if (number < min) return min;
  if (number > max) return max;
  return number;
}
