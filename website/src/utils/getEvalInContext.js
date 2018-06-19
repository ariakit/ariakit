const getEvalInContext = object => {
  if (typeof object !== "object") return null;

  if (Array.isArray(object)) {
    return object.reduce((evalInContext, item) => {
      if (evalInContext) return evalInContext;
      return getEvalInContext(item);
    }, null);
  }

  return Object.keys(object).reduce((evalInContext, key) => {
    if (evalInContext) return evalInContext;
    if (key === "evalInContext") return object[key];
    if (typeof object[key] === "object") return getEvalInContext(object[key]);
    return evalInContext;
  }, null);
};

export default getEvalInContext;
