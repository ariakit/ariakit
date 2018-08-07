const omit = (target, undesired = []) => {
  const targetKeys = Object.keys(target);
  let result = {};

  for (let index = 0; index < targetKeys.length; index += 1) {
    const element = targetKeys[index];
    // eslint-disable-next-line no-continue
    if (undesired.includes(element)) continue;
    result = Object.assign(result, { [element]: target[element] });
  }

  return result;
};

export default omit;
