import isPropValid from "@emotion/is-prop-valid";
import { PropsWithLol } from "./types";

function pickHTMLProps<P extends Record<string, any>>(props: P) {
  const filteredProps = {} as P;

  for (const prop in props) {
    if (isPropValid(prop)) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps as PropsWithLol<P>;
}

export default pickHTMLProps;
