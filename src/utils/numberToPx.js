const numberToPx = value => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

export default numberToPx;
