import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not change an already checked custom radio", async ({ q }) => {
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("selects a custom radio after the owner resets checked", async ({
    q,
  }) => {
    await q.radio("Controlled orange").click();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
    await q.button("Reset controlled radios").click();
    await test.expect(q.radio("Controlled apple")).toBeChecked();
    await q.radio("Controlled orange").click();
    await test.expect(q.radio("Controlled orange")).toBeChecked();
    await test.expect(q.status("Controlled change count")).toHaveText("2");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("does not change an already checked controlled custom radio", async ({
    q,
  }) => {
    await q.radio("Controlled orange").click();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
    await q.radio("Controlled orange").click();
    await test.expect(q.radio("Controlled orange")).toBeChecked();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
  });
});
