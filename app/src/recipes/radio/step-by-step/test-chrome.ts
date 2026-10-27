import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves focus into the next question and back to the answer", async ({
    q,
  }) => {
    await test.expect(q.button("Next")).toBeDisabled();
    await q.text("React").click();
    await test.expect(q.radio("React Recommended")).toBeChecked();
    await q.button("Next").click();
    const server = q.radio("On the server Recommended");
    await test.expect(server).toBeFocused();
    await test.expect(server).not.toBeChecked();
    await q.button("Back").click();
    await test.expect(q.radio("React Recommended")).toBeFocused();
    await test.expect(q.radio("React Recommended")).toBeChecked();
  });

  test("clears the answer to the current question", async ({ q }) => {
    await q.text("Solid").click();
    await test.expect(q.radio("Solid")).toBeChecked();
    const clear = q.button("Clear");
    await clear.click();
    await test.expect(q.radio("Solid")).not.toBeChecked();
    await test.expect(q.button("Next")).toBeDisabled();
    await test.expect(clear).toBeDisabled();
    await test.expect(clear).toBeFocused();
  });

  test("sends the answers as a reply and changes them", async ({ q }) => {
    await q.text("React").click();
    await q.button("Next").click();
    await q.text("At build time").click();
    await q.button("Send answers").click();
    await test.expect(q.text("React, At build time")).toBeVisible();
    const change = q.button("Change answers");
    await test.expect(change).toBeFocused();
    await change.click();
    await test.expect(q.radio("React Recommended")).toBeFocused();
    await test.expect(q.radio("React Recommended")).toBeChecked();
  });
});
