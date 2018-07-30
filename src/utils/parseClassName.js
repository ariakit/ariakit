import uniq from "lodash/uniq";

const parseClassName = className =>
  className && uniq(className.split(" ")).join(" ");

export default parseClassName;
