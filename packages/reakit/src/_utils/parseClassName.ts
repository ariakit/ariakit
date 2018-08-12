import uniq from "./uniq";

const parseClassName = (className?: string) =>
  className && uniq(className.split(" ")).join(" ");

export default parseClassName;
