import { pick } from "../__utils/pick";
import { omit } from "../__utils/omit";

export function splitProps<P, K extends keyof P>(
  props: P,
  keys: ReadonlyArray<K> | K[]
) {
  const picked = pick(props, keys);
  const omitted = omit(props, keys);

  return [picked, omitted] as [typeof picked, typeof omitted];
}
