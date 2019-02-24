export function extractPropFromObjects<T, K extends keyof T>(
  propsObjects: T[],
  prop: K
) {
  const props: Array<NonNullable<T[K]>> = [];
  const { length } = propsObjects;

  for (let i = 0; i < length; i += 1) {
    const p = propsObjects[i][prop];
    if (p) props.push(p!);
  }

  return props;
}
