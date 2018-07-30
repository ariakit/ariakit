import uniq from "lodash/uniq";

const parseClassName = className =>
  className && _.uniq(className.split(" ")).join(" ");

export default parseClassName;
