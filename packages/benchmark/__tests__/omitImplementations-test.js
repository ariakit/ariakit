import {
  omitFor,
  omitForeach,
  omitForof,
  omitReduce,
  omitWhile
} from "../omitImplementations";

[omitFor, omitForeach, omitForof, omitReduce, omitWhile].map(fn => {
  test(`${fn.name} implements lodash omit`, () => {
    expect(fn({ a: 1, b: 2, c: 3, d: 4 }, ["a", "b"])).toEqual({ c: 3, d: 4 });
  });
  return null;
});
