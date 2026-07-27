import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders every controlled, uncontrolled, and parent default value", async ({
    page,
    q,
  }) => {
    const logs: unknown[] = [];
    page.on("console", async (message) => {
      if (message.type() !== "log") return;
      const argument = message.args()[0];
      if (!argument) return;
      logs.push(await argument.jsonValue());
    });
    const item = (role: "checkbox" | "radio", label: string) => {
      const options = { includeHidden: true };
      if (role === "checkbox") {
        return q.menuitemcheckbox(label, options);
      }
      return q.menuitemradio(label, options);
    };
    await test
      .expect(item("checkbox", "Banana (checkboxControlled)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("checkbox", "Orange (checkboxParent)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("checkbox", "Banana (checkboxUncontrolled)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("checkbox", "Grape (checkboxUncontrolled)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("radio", "Banana (radioControlled)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("radio", "Orange (radioParent)"))
      .toHaveAttribute("aria-checked", "true");
    await test
      .expect(item("radio", "Banana (radioUncontrolled)"))
      .toHaveAttribute("aria-checked", "true");
    test.expect(logs).toEqual([]);
  });

  for (const group of [
    "checkboxControlled",
    "checkboxUncontrolled",
    "checkboxParent",
  ] as const) {
    test(`${group} follows its controlled update contract`, async ({
      page,
      q,
    }) => {
      const logs: unknown[] = [];
      page.on("console", async (message) => {
        if (message.type() !== "log") return;
        const argument = message.args()[0];
        if (!argument) return;
        logs.push(await argument.jsonValue());
      });
      await q.button("Menu").click();
      for (const fruit of ["Apple", "Banana", "Grape", "Orange"]) {
        const item = q.menuitemcheckbox(`${fruit} (${group})`, {
          includeHidden: true,
        });
        if (fruit === "Grape") {
          await test.expect(item).toHaveAttribute("aria-disabled", "true");
          continue;
        }
        await item.click();
      }

      const expected =
        group === "checkboxControlled"
          ? ["Orange"]
          : group === "checkboxUncontrolled"
            ? ["Apple", "Grape", "Orange"]
            : ["Banana"];
      for (const fruit of ["Apple", "Banana", "Grape", "Orange"]) {
        await test
          .expect(
            q.menuitemcheckbox(`${fruit} (${group})`, {
              includeHidden: true,
            }),
          )
          .toHaveAttribute(
            "aria-checked",
            expected.includes(fruit) ? "true" : "false",
          );
      }

      const expectedLog =
        group === "checkboxUncontrolled"
          ? ["Grape", "Apple", "Orange"]
          : expected;
      test.expect(logs.at(-1)).toMatchObject({ [group]: expectedLog });

      if (group === "checkboxUncontrolled") {
        await q
          .menuitemcheckbox(`Orange (${group})`, { includeHidden: true })
          .click();
        await q
          .menuitemcheckbox(`Apple (${group})`, { includeHidden: true })
          .click();
        await test
          .expect(
            q.menuitemcheckbox(`Grape (${group})`, { includeHidden: true }),
          )
          .toHaveAttribute("aria-checked", "true");
        test.expect(logs.at(-1)).toMatchObject({ [group]: ["Grape"] });
      } else {
        const remaining = expected[0];
        if (!remaining) return;
        await q
          .menuitemcheckbox(`${remaining} (${group})`, {
            includeHidden: true,
          })
          .click();
        test.expect(logs.at(-1)).toMatchObject({ [group]: [] });
      }
    });
  }

  for (const group of [
    "radioControlled",
    "radioUncontrolled",
    "radioParent",
  ] as const) {
    test(`${group} accepts and rejects the same item updates`, async ({
      page,
      q,
    }) => {
      const logs: unknown[] = [];
      page.on("console", async (message) => {
        if (message.type() !== "log") return;
        const argument = message.args()[0];
        if (!argument) return;
        logs.push(await argument.jsonValue());
      });
      await q.button("Menu").click();

      const expectedAfterApple =
        group === "radioControlled"
          ? "Banana"
          : group === "radioUncontrolled"
            ? "Apple"
            : "Orange";
      const apple = q.menuitemradio(`Apple (${group})`, {
        includeHidden: true,
      });
      const logCount = logs.length;
      await apple.click();
      await test
        .expect(
          q.menuitemradio(`${expectedAfterApple} (${group})`, {
            includeHidden: true,
          }),
        )
        .toHaveAttribute("aria-checked", "true");
      if (group !== "radioUncontrolled") {
        test.expect(logs).toHaveLength(logCount);
      }

      const grape = q.menuitemradio(`Grape (${group})`, {
        includeHidden: true,
      });
      await test.expect(grape).toHaveAttribute("aria-disabled", "true");

      const orange = q.menuitemradio(`Orange (${group})`, {
        includeHidden: true,
      });
      const beforeOrange = logs.length;
      await orange.click();
      const orangeAccepted = group !== "radioParent";
      await test.expect(orange).toHaveAttribute("aria-checked", "true");
      if (orangeAccepted) {
        test.expect(logs.at(-1)).toMatchObject({ [group]: "Orange" });
      } else {
        test.expect(logs).toHaveLength(beforeOrange);
      }

      const banana = q.menuitemradio(`Banana (${group})`, {
        includeHidden: true,
      });
      await banana.click();
      await test.expect(banana).toHaveAttribute("aria-checked", "true");
      if (group !== "radioUncontrolled" || expectedAfterApple !== "Banana") {
        test.expect(logs.at(-1)).toMatchObject({ [group]: "Banana" });
      }
    });
  }

  test("keyboard traversal and typeahead ignore disabled values", async ({
    page,
    q,
  }) => {
    await q.button("Menu").press("Enter");
    await test
      .expect(q.menuitemcheckbox("Apple (checkboxControlled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemcheckbox("Banana (checkboxControlled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemcheckbox("Orange (checkboxControlled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemcheckbox("Apple (checkboxUncontrolled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemcheckbox("Banana (checkboxUncontrolled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemcheckbox("Orange (checkboxUncontrolled)"))
      .toBeFocused();
    await page.keyboard.type("bbbb");
    await test
      .expect(q.menuitemradio("Banana (radioControlled)"))
      .toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.menuitemradio("Orange (radioControlled)"))
      .toBeFocused();
  });

  test("external reset clears the controlled radio and its checkmark", async ({
    q,
  }) => {
    await q.button("Menu").click();
    const orange = q.menuitemradio("Orange (radioControlled)");
    await test.expect(orange).toHaveAttribute("aria-checked", "false");
    await test.expect(orange.locator("svg")).toHaveCount(0);
    await orange.click();
    await test.expect(orange).toHaveAttribute("aria-checked", "true");
    await test.expect(orange.locator("svg")).toHaveCount(1);
    await q.button("Reset radioControlled").click();
    await q.button("Menu").click();
    const resetOrange = q.menuitemradio("Orange (radioControlled)");
    await test.expect(resetOrange).toHaveAttribute("aria-checked", "false");
    await test.expect(resetOrange.locator("svg")).toHaveCount(0);
  });
});
