const omit = (target, undesired = []) => {
  let result = {};
  Object.keys(target).forEach(key => {
    if (undesired.indexOf(key) === -1)
      result = Object.assign(result, { [key]: target[key] });
  });
  return result;
};

export default omit;
