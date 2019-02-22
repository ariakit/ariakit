import pick from "./pick";
import omit from "./omit";

function splitProps<P, K extends keyof P>(props: P, keys: K[]) {
  const picked = pick(props, keys);
  const omitted = omit(props, keys);

  return [picked, omitted] as [typeof picked, typeof omitted];
}

export default splitProps;
