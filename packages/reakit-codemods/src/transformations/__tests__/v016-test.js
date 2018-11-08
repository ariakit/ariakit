jest.autoMockOff();
const { defineTest } = require("jscodeshift/dist/testUtils");

describe("V016 transformations", () => {
  defineTest(__dirname, "v016", null, "v016-1");
  defineTest(__dirname, "v016", null, "v016-2");
  defineTest(__dirname, "v016", null, "v016-3");
  defineTest(__dirname, "v016", null, "v016-4");
  defineTest(__dirname, "v016", null, "v016-5");
});
