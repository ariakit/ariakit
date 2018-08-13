const Benchmark = require("benchmark");

export const omitFor = (target, undesired = []) => {
  const targetKeys = Object.keys(target);
  const result = {};

  for (let index = 0; index < targetKeys.length; index += 1) {
    const key = targetKeys[index];
    if (undesired.indexOf(key) === -1) result[key] = target[key];
  }

  return result;
};

export const omitForeach = (target, undesired = []) => {
  const result = {};
  Object.keys(target).forEach(key => {
    if (undesired.indexOf(key) === -1) {
      result[key] = target[key];
    }
  });
  return result;
};

export const omitForof = (target, undesired = []) => {
  const result = {};
  const keys = Object.keys(target);
  // eslint-disable-next-line
  for (const key of keys) {
    if (undesired.indexOf(key) === -1) {
      result[key] = target[key];
    }
  }
  return result;
};

export const omitWhile = (target, undesired = []) => {
  const result = {};
  const keys = Object.keys(target);
  const { length } = keys;
  let i = 0;

  while (i < length) {
    const key = keys[i];
    if (undesired.indexOf(key) === -1) result[key] = target[key];
    i += 1;
  }

  return result;
};

export const omitReduce = (target, undesired = []) =>
  Object.keys(target).reduce(
    (finalObject, key) => ({
      ...finalObject,
      ...(undesired.indexOf(key) === -1 ? { [key]: target[key] } : {})
    }),
    {}
  );

const omitBench = new Benchmark.Suite("different omit implementations")
  .add("omitFor", () => omitFor({ a: 1, b: 2 }, "a"))
  .add("omitForeach", () => omitForeach({ a: 1, b: 2 }, "a"))
  .add("omitReduce", () => omitReduce({ a: 1, b: 2 }, "a"))
  .add("omitForof", () => omitForof({ a: 1, b: 2 }, "a"))
  .add("omitWhile", () => omitWhile({ a: 1, b: 2 }, "a"))
  // eslint-disable-next-line no-console
  .on("cycle", event => console.log(String(event.target)));

omitBench.run({ async: true });
