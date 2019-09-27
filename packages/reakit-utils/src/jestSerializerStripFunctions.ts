import { isObject } from "./isObject";

export const jestSerializerStripFunctions: jest.SnapshotSerializerPlugin = {
  test: val =>
    isObject(val) &&
    !Array.isArray(val) &&
    Object.values(val).find(v => typeof v === "function"),
  print: (val, serialize) =>
    serialize(
      Object.keys(val)
        .filter(key => typeof val[key] !== "function")
        .reduce(
          (acc, curr) => ({
            ...acc,
            [curr]: val[curr]
          }),
          {}
        )
    )
};
