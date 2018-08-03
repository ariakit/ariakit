const numberToPx = value => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (!value) {
    return `0px`;
  }
  return value;
};

export default numberToPx;
