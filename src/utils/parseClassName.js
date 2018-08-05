import { uniq } from "./lodash-like";

const parseClassName = className =>
  className && uniq(className.split(" ")).join(" ");

export default parseClassName;
