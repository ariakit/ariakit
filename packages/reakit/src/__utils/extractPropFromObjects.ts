export function extractPropFromObjects<T, K extends keyof T>(
  objects: T[],
  prop: K
) {
  const props: Array<NonNullable<T[K]>> = [];
  const { length } = objects;

  for (let i = 0; i < length; i += 1) {
    const p = objects[i][prop];
    if (p) props.push(p!);
  }

  return props;
}
