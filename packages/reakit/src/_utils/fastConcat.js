const fastConcat = (arr1, arr2) => {
  const { length: length1 } = arr1 || { length: 0 };
  const { length: length2 } = arr2 || { length: 0 };
  let index = 0;
  let resultIndex = 0;
  const result = new Array(length1 + length2);

  while (index < length1) {
    result[resultIndex] = arr1[index];
    index += 1;
    resultIndex += 1;
  }

  index = 0;

  while (index < length2) {
    result[resultIndex] = arr2[index];
    index += 1;
    resultIndex += 1;
  }

  return result;
};

export default fastConcat;
