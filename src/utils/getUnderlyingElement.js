const getUnderlyingElement = props => {
  const { as, nextAs = [] } = props;
  const [lastElement] = nextAs.slice(-1);
  if (typeof as === "string") {
    return as;
  }
  if (nextAs.length && typeof lastElement === "string") {
    return lastElement;
  }

  return "span";
};

export default getUnderlyingElement;
