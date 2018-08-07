import omit from "../../src/utils/omit";

export default () => omit({ a: 1, b: 2, c: 3 }, ["a", "c"]);
