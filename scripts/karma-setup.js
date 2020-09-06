// This file attempts to mock the features of jest that we are using in our tests so that they run in jasmine.
// Luckily jasmine is quite similar to jest in its API
import jest from "jest-mock";
import expect from "expect";

window.test = window.it;
window.test.each = (inputs) => (testName, test) =>
  inputs.forEach((args) =>
    window.it(testName, () =>
      Array.isArray(args) ? test(...args) : test(args)
    )
  );

window.test.todo = () => {
  return undefined;
};
window.jest = jest;
window.expect = expect;
