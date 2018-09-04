const numberToPx = (value?: string | number) => {
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (!value) {
    return `0px`;
  }
  return value;
};

export default numberToPx;
