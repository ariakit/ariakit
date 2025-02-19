import { focus, press, q } from "@ariakit/test";
import { createBenchmarker } from "../benchmark.ts";

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
