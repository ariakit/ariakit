const fastMap = (func, list) => {
  let i = 0;
  const result = [];
  const { length } = list;

  while (i < length) {
    const returned = func.call(null, list[i], i, list);
    result.push(returned);
    i += 1;
  }

  return result;
};

export default fastMap;
