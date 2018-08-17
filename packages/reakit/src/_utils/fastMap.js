const fastMap = (list, func) => {
  let index = 0;
  const { length } = list;
  const result = new Array(length);

  while (index < length) {
    result[index] = func.call(null, list[index], index, list);
    index += 1;
  }

  return result;
};

export default fastMap;
