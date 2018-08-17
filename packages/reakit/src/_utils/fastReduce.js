const fastReduce = (list, func, initial) => {
  let accumulator = initial != null && initial !== false ? initial : list[0];
  let index = 0;
  const { length } = list;

  while (index < length) {
    accumulator = func.call(null, accumulator, list[index], list);
    index += 1;
  }

  return accumulator;
};

export default fastReduce;
