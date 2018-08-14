import validAttr from "styled-components/lib/utils/validAttr";

function pickHTMLProps<P extends object>(props: P): Partial<P> {
  const filteredProps = {};
  const keys = Object.keys(props);
  for (const key of keys) {
    if (validAttr(key)) {
      filteredProps[key] = props[key];
    }
  }
  return filteredProps;
}

export default pickHTMLProps;
