const uniq = (arr = []) =>
  arr.sort().filter((element, index, array) => element !== array[index + 1]);

export default uniq;
