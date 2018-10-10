import CSSProps from "./CSSProps";

function pickCSSProps<P extends object>(props: P) {
  let filteredProps: Partial<P> | undefined;

  for (const prop in props) {
    if (prop in CSSProps) {
      if (!filteredProps) {
        filteredProps = {};
      }
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
}

export default pickCSSProps;
