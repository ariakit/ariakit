const PuppeteerEnvironment = require("jest-environment-puppeteer");
require("pptr-testing-library/extend");

class CustomEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup();
    // Your setup
  }

  async teardown() {
    // Your teardown
    await super.teardown();
  }
}

module.exports = CustomEnvironment;
