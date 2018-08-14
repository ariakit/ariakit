import validAttr from "./validAttr";

function pickHTMLProps<P extends object>(props: P): Partial<P> {
  const filteredProps: Partial<P> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in props) {
    if (validAttr(prop)) {
      filteredProps[prop] = props[prop];
    }
  }
  return filteredProps;
}

export default pickHTMLProps;
