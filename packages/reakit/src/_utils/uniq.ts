const uniq = (arr: any[] = []) => {
  const used: { [key: string]: any } = {};

  return arr.filter(el => {
    if (used[el]) return false;
    used[el] = true;
    return true;
  });
};

export default uniq;
