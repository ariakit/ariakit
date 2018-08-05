const getUnderlyingElement = ({ as, nextAs = [] }) => {
  if (typeof as === "string") {
    return as;
  }
  if (nextAs.length) {
    const [lastElement] = nextAs.slice(-1);

    if (typeof lastElement === "string") {
      return lastElement;
    }
  }
  return "div";
};

export default getUnderlyingElement;
