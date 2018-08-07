const omit = (target, undesired = []) => {
  const targetKeys = Object.keys(target);
  const result = {};

  for (let index = 0; index < targetKeys.length; index += 1) {
    const key = targetKeys[index];
    if (undesired.indexOf(key) === -1) result[key] = target[key];
  }

  return result;
};

export default omit;
