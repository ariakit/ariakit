const uniq = (arr = []) => {
  const used = {};

  return arr.filter(el => {
    if (used[el]) return false;
    used[el] = true;
    return true;
  });
};

const uniq2 = (arr = []) =>
  arr.sort().filter((element, index, array) => element !== array[index + 1]);

export default uniq;
