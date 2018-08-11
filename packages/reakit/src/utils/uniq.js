const uniq = (arr = []) => {
  const used = {};

  return arr.filter(el => {
    if (used[el]) return false;
    used[el] = true;
    return true;
  });
};

export default uniq;
