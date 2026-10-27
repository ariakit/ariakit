import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("RadioGroupLabel names the radio group", async ({ q }) => {
    const group = q.radiogroup("Favorite fruit");
    await test.expect(group).toBeVisible();
    await test.expect(group).toHaveAccessibleName("Favorite fruit");
  });

  test("aria-label takes precedence over RadioGroupLabel", async ({ q }) => {
    const group = q.radiogroup("Shipping speed");
    await test.expect(group).toBeVisible();
    await test.expect(group).toHaveAccessibleName("Shipping speed");
    await test.expect(group).not.toHaveAttribute("aria-labelledby");
  });

  test("RadioGroupLabel names a radio group rendered as a Group", async ({
    q,
  }) => {
    const group = q.radiogroup("View");
    await test.expect(group).toBeVisible();
    await test.expect(group).toHaveAccessibleName("View");
  });

  test("RadioGroupLabel names a radio group rendered as a useGroup component", async ({
    q,
  }) => {
    const group = q.radiogroup("Payment method");
    await test.expect(group).toBeVisible();
    await test.expect(group).toHaveAccessibleName("Payment method");
  });

  test("RadioGroupLabel does not rename a parent Group", async ({ q }) => {
    const group = q.group("Notifications");
    await test.expect(group).toBeVisible();
    await test.expect(group).toHaveAccessibleName("Notifications");
    const radioGroup = q.radiogroup("Email frequency");
    await test.expect(radioGroup).toBeVisible();
    await test.expect(radioGroup).toHaveAccessibleName("Email frequency");
  });
});
