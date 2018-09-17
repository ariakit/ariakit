function toArray<T>(arg: T | T[]) {
  return Array.isArray(arg) ? arg : [arg];
}

export default toArray;
