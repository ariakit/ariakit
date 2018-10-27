const path = require("path");
const spawnCLI = require("../utils/binSpawner");
const readFile = require("../utils/fixtureReader");

describe("first test", () => {
  it("it should transform everything correctly", async done => {
    try {
      await spawnCLI("v016", path.resolve("./test-fixture.js"));
      expect(readFile("./test-fixture")).toEqual(readFile("./result"));
    } catch (error) {
      done.fail(error);
    }
  });
});
