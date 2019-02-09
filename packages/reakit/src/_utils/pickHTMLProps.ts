import { AllHTMLAttributes } from "react";
import isPropValid from "@emotion/is-prop-valid";

function pickHTMLProps<P extends Record<string, any>>(props: P) {
  const filteredProps = {} as P;

  for (const prop in props) {
    if (isPropValid(prop)) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps as Pick<P, keyof AllHTMLAttributes<any>>;
}

export default pickHTMLProps;
