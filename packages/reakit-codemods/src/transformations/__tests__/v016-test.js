jest.autoMockOff();
const { defineTest } = require("jscodeshift/dist/testUtils");

defineTest(__dirname, "v016");
