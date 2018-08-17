const fastFilter = (list, func) => {
  let index = 0;
  let tempIndex = 0;
  const { length } = list;
  const temp = new Array(length);

  while (index < length) {
    if (func.call(null, list[index], index, list)) {
      temp[tempIndex] = list[index];
      tempIndex += 1;
    }
    index += 1;
  }

  // Remove empty elements at the end of temp. Like a fast slice.
  index = 0;
  const result = new Array(tempIndex);

  while (index < tempIndex) {
    result[index] = temp[index];
    index += 1;
  }
  return result;
};

export default fastFilter;
