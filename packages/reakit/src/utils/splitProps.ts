import pick from "../_utils/pick";
import omit from "../_utils/omit";

export function splitProps<P, K extends keyof P>(
  props: P,
  keys: ReadonlyArray<K> | K[]
) {
  const picked = pick(props, keys);
  const omitted = omit(props, keys);

  return [picked, omitted] as [typeof picked, typeof omitted];
}

export default splitProps;
