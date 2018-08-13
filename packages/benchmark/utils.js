const Benchmark = require("benchmark");
const fastMap = require("../reakit/src/_utils/fastMap");
const fastReduce = require("../reakit/src/_utils/fastReduce");
const fastFilter = require("../reakit/src/_utils/fastFilter");

const fixture = [2, 3, 4, 5];

const utilsBench = new Benchmark.Suite("Util benchmark")
  .add("Array.prototype.map", () => fixture.map(x => x * 2))
  .add("fastMap", () => fastMap(x => x * 2, fixture))
  .add("Array.prototype.reduce", () => fixture.reduce((acc, x) => x + acc, 0))
  .add("fastReduce", () => fastReduce((acc, x) => x + acc, 0, fixture))
  .add("Array.prototype.filter", () => fixture.filter(x => x > 3))
  .add("fastFilter", () => fastFilter(x => x > 3, fixture))
  // eslint-disable-next-line no-console
  .on("cycle", event => console.log(String(event.target)));

utilsBench.run({ async: true });
