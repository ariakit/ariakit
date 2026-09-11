import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "progress-fixtures" },
  async ({ test, query }) => {
    test("moves the bar and the ring to each new value", async ({ q }) => {
      const scope = query(q.article("Value change"));
      const bar = scope.progressbar("Build bar");
      const ring = scope.progressbar("Build ring");
      const barFill = bar.locator(":scope > div");
      const ringArc = ring.locator(":scope > div");

      // The fill animates for a second, so poll until it settles.
      const getBarRatio = () =>
        barFill.evaluate((node) => {
          const track = node.parentElement?.getBoundingClientRect();
          if (!track) return 0;
          const ratio = node.getBoundingClientRect().width / track.width;
          return Math.round(ratio * 100) / 100;
        });
      const getRingValue = () =>
        ringArc.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--progress-value"),
        );

      await test.expect(bar).toHaveAttribute("aria-valuenow", "0.2");
      await test.expect(ring).toHaveAttribute("aria-valuenow", "0.2");
      await test.expect.poll(getBarRatio).toBe(0.2);
      await test.expect.poll(getRingValue).toBe("0.2");

      await scope.button("Advance").click();
      await test.expect(bar).toHaveAttribute("aria-valuenow", "0.5");
      await test.expect(ring).toHaveAttribute("aria-valuenow", "0.5");
      await test.expect.poll(getBarRatio).toBe(0.5);
      await test.expect.poll(getRingValue).toBe("0.5");

      await scope.button("Advance").click();
      await scope.button("Advance").click();
      await test.expect(bar).toHaveAttribute("aria-valuenow", "1");
      await test.expect.poll(getBarRatio).toBe(1);
      await test.expect.poll(getRingValue).toBe("1");

      await scope.button("Reset").click();
      await test.expect(bar).toHaveAttribute("aria-valuenow", "0");
      await test.expect(ring).toHaveAttribute("aria-valuenow", "0");
      await test.expect.poll(getBarRatio).toBe(0);
      await test.expect(scope.button("Advance")).toBeVisible();
    });
  },
);
