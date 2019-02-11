import isPropValid from "@emotion/is-prop-valid";
import { ExtractHTMLAttributes } from "./types";

function pickHTMLProps<P extends Record<string, any>>(props: P) {
  const filteredProps = {} as P;

  for (const prop in props) {
    if (isPropValid(prop)) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps as ExtractHTMLAttributes<P>;
}

export default pickHTMLProps;
