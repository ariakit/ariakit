const Benchmark = require("benchmark");
const fastMap = require("../reakit/src/_utils/fastMap");

const arrayFixture = [2, 3, 4, 5];

const utilsBench = new Benchmark.Suite("Util benchmark")
  .add("Array.prototype.map", () => arrayFixture.map(x => x * 2))
  .add("fastMap", () => fastMap(x => x * 2, arrayFixture))
  // eslint-disable-next-line no-console
  .on("cycle", event => console.log(String(event.target)));

utilsBench.run({ async: true });
