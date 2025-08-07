import { focus, press, q } from "@ariakit/test";

test("correctly traps focus", async () => {
  const qq = q.within(q.group("trap"));

  await focus(qq.text("Start"));
  await press.Tab();
  expect(qq.text("Before")).toHaveFocus();
  await press.Tab();
  expect(qq.text("Trap")).toHaveFocus();
  await press.Tab();
  expect(qq.text("After")).toHaveFocus();
});

test("correctly redirects focus", async () => {
  const qq = q.within(q.group("redirect"));

  await focus(qq.text("Start"));
  await press.Tab();
  expect(qq.text("Before")).toHaveFocus();
  await press.Tab();
  expect(qq.text("Focus target")).toHaveFocus();
  await press.ShiftTab();
  expect(qq.text("Skip")).toHaveFocus();
  await press.ShiftTab();
  expect(qq.text("Focus target")).toHaveFocus();
});
