import uniq from "lodash/uniq";

const parseClassName = className => {
  if (!className) return className;
  return uniq(className.split(" ")).join(" ");
};

export default parseClassName;
