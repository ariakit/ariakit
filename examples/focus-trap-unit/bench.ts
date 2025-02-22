import { focus, press, q } from "@ariakit/test";
import { createBenchmarker } from "../benchmark.ts";

// put the setup in the component, there usually isn't anything else we need to add right?
// lets assume we need to test in the setup.

// todo:
// 1. setup/teardown in vitest hooks.
// 2. When benchmark mode
//   1. replace test with bench
//   2. remove all assertions.
//   3. if test ends up empty, skip tests.
//   4.
const test = createBenchmarker(__dirname);

test("correctly traps focus", async () => {
  const qq = q.within(q.group("trap"));

  await focus(qq.text("Start"));
  await press.Tab();
  await press.Tab();
  await press.Tab();
});

test("correctly redirects focus", async () => {
  const qq = q.within(q.group("redirect"));

  await focus(qq.text("Start"));
  await press.Tab();
  await press.Tab();
  await press.ShiftTab();
  await press.ShiftTab();
});
