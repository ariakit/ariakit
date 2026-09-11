import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "disclosure" },
  async ({ test, query }) => {
    test("shares the open state of a controlled disclosure with an outside button", async ({
      page,
      q,
    }) => {
      const example = query(q.article("Controlled"));
      const toggle = example.button("Toggle delivery details");
      const button = example.button("Delivery details");
      const text = example.text(
        "Standard delivery takes three to five business days.",
      );
      const contentId = await toggle.getAttribute("aria-controls");
      test.expect(contentId).toBeTruthy();
      await test
        .expect(button)
        .toHaveAttribute("aria-controls", contentId ?? "");
      await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await test.expect(text).toBeHidden();

      await toggle.click();
      await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
      await test.expect(button).toHaveAttribute("aria-expanded", "true");
      await test.expect(page.locator(`[id="${contentId}"]`)).toBeVisible();
      await test.expect(text).toBeVisible();

      await button.click();
      await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      await test.expect(text).toBeHidden();
    });

    test("opens and closes group members independently", async ({ q }) => {
      const group = query(q.article("Group"));
      const change = group.button("Can I change my plan?");
      const refunds = group.button("Do you offer refunds?");
      await test.expect(change).toHaveAttribute("aria-expanded", "true");
      await test.expect(refunds).toHaveAttribute("aria-expanded", "false");
      await refunds.click();
      await test.expect(refunds).toHaveAttribute("aria-expanded", "true");
      await test.expect(change).toHaveAttribute("aria-expanded", "true");
      await test
        .expect(group.text("We refund any payment made in the last 30 days."))
        .toBeVisible();
    });
  },
);
