import { isPlainObject } from "./isPlainObject";
import { As, PropsWithAs } from "./types";

export function normalizePropsAreEqual<O, T extends As>(
  propsAreEqual: (prev: O, next: O) => boolean
): (prev: PropsWithAs<O, T>, next: PropsWithAs<O, T>) => boolean {
  if (propsAreEqual.name === "normalizePropsAreEqualInner") {
    return (propsAreEqual as unknown) as (
      prev: PropsWithAs<O, T>,
      next: PropsWithAs<O, T>
    ) => boolean;
  }

  return function normalizePropsAreEqualInner(
    prev: PropsWithAs<O, T>,
    next: PropsWithAs<O, T>
  ) {
    if (!isPlainObject(prev.state) || !isPlainObject(next.state)) {
      return propsAreEqual((prev as unknown) as O, (next as unknown) as O);
    }

    return propsAreEqual(
      ({ ...prev.state, ...prev } as unknown) as O,
      ({
        ...next.state,
        ...next,
      } as unknown) as O
    );
  };
}
