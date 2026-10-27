import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("marks the answers with words after a wrong check", async ({ q }) => {
    const group = query(
      q.radiogroup("What should name a group of radio buttons?"),
    );
    const check = q.button("Check");
    await test.expect(check).toBeDisabled();
    await group.text("A title attribute on the group").click();
    await check.click();
    await test
      .expect(group.radio("A title attribute on the group Your answer"))
      .toBeDisabled();
    await test
      .expect(group.radio("A visible label for the group Correct answer"))
      .toBeDisabled();
    await test
      .expect(q.status())
      .toHaveText("Not quite. A visible label names the group for everyone.");
    await test.expect(q.button("Try again")).toBeFocused();
  });

  test("starts over and keeps focus on the button", async ({ q }) => {
    const group = query(
      q.radiogroup("What should name a group of radio buttons?"),
    );
    await group.text("A visible label for the group").click();
    await q.button("Check").click();
    await test
      .expect(q.status())
      .toHaveText("Correct. A visible label names the group for everyone.");
    await q.button("Try again").click();
    const check = q.button("Check");
    await test.expect(check).toBeFocused();
    await test.expect(check).toBeDisabled();
    await test.expect(q.status()).toHaveText("");
    await test
      .expect(group.radio("A visible label for the group"))
      .not.toBeChecked();
    await test
      .expect(group.radio("A visible label for the group"))
      .toBeEnabled();
  });
});
