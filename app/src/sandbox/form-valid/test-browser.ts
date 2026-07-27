import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("disables submission by default, after invalidation, and after reset", async ({
    q,
  }) => {
    const submit = q.button("Add");
    const email = q.textbox("Email");

    await test.expect(submit).toHaveAttribute("aria-disabled", "true");
    await q.textbox("Name").fill("a");
    await email.fill("a@a");
    await test.expect(submit).not.toHaveAttribute("aria-disabled");

    await q.textbox("Name").fill("");
    await test.expect(submit).toHaveAttribute("aria-disabled", "true");
    await q.textbox("Name").fill("a");
    await test.expect(submit).not.toHaveAttribute("aria-disabled");

    await q.button("Reset").click();
    await test.expect(submit).toHaveAttribute("aria-disabled", "true");
  });

  test("disables submission after a valid form is submitted", async ({ q }) => {
    const submit = q.button("Add");
    await q.textbox("Name").fill("a");
    await q.textbox("Email").fill("a@a");
    await test.expect(submit).not.toHaveAttribute("aria-disabled");

    await submit.click();
    await test.expect(submit).toHaveAttribute("aria-disabled", "true");
  });
});
