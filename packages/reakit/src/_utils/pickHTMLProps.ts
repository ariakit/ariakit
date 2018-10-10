import isPropValid from "@emotion/is-prop-valid";

function pickHTMLProps<P extends object>(props: P) {
  const filteredProps: Partial<P> = {};

  for (const prop in props) {
    if (isPropValid(prop)) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
}

export default pickHTMLProps;
