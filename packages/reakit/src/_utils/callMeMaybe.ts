type Args<T> = T extends (...args: infer U) => any ? U : never;

function callMeMaybe<T>(maybeFn: T, ...args: Args<T>) {
  if (typeof maybeFn === "function") {
    return maybeFn(...args);
  }
  return maybeFn;
}

export default callMeMaybe;
