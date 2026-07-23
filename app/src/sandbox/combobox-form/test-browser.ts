import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/5058
  test("submits every selected value", async ({ q }) => {
    const combobox = q.combobox("Favorite fruits");
    await combobox.click();
    await q.option("Apple").click();
    await q.option("Orange").click();
    await combobox.fill("typed search");
    await combobox.press("Escape");
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText('["apple","orange"]');
  });

  // https://github.com/ariakit/ariakit/issues/5058
  test("does not submit an empty search value", async ({ q }) => {
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText("[]");
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
  test("preserves the input label metadata after hydration", async ({ q }) => {
    await q.combobox("Favorite fruits").click();
    await q.option("Apple").click();

    const labels = await q.combobox("Favorite fruits").evaluate((element) => {
      const input = element as HTMLInputElement;
      return Array.from(input.labels ?? [], (label) =>
        label.textContent?.trim(),
      );
    });

    test.expect(labels).toEqual(["Favorite fruits"]);
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
  test("submits selected values when composite is false", async ({ q }) => {
    const form = q.form("Non-composite fruits");
    const input = q.combobox("Non-composite fruits");
    const values = await form.evaluate((element) =>
      new FormData(element as HTMLFormElement).getAll("non-composite-fruits"),
    );
    const inputForm = await input.evaluate(
      (element) => (element as HTMLInputElement).form?.id ?? null,
    );

    test.expect(values).toEqual(["apple"]);
    test.expect(inputForm).toBe("non-composite-form");
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3625787623
  test("omits aria-disabled selected values", async ({ q }) => {
    const form = q.form("Disabled fruits");
    await test.expect(q.combobox("Disabled fruits")).toBeDisabled();

    const values = await form.evaluate((element) =>
      new FormData(element as HTMLFormElement).getAll("disabled-fruits"),
    );

    test.expect(values).toEqual([]);
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623937766
  test("preserves implicit submission with an explicit form", async ({ q }) => {
    const form = q.form("Non-composite fruits");
    await form.evaluate((element) => {
      element.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          const submitter = (event as SubmitEvent).submitter;
          element.setAttribute(
            "data-submitter",
            submitter?.textContent?.trim() ?? "",
          );
        },
        { once: true },
      );
    });

    await q.combobox("Non-composite fruits").press("Enter");

    await test
      .expect(form)
      .toHaveAttribute("data-submitter", "Submit non-composite fruits");
  });

  // https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740415
  test("keeps selected values in sync after form reset", async ({ q }) => {
    const combobox = q.combobox("Favorite fruits");
    await combobox.click();
    await q.option("Apple").click();
    await combobox.press("Escape");
    await q.button("Reset").click();
    await q.button("Submit").click();

    await test.expect(q.status()).toHaveText('["apple"]');
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("resets an uncontrolled combobox with a native reset button", async ({
    q,
  }) => {
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");

    await name.fill("Chance");
    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset address").click();

    await test.expect(name).toHaveValue("");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("resets a combobox to its default value with form.reset()", async ({
    q,
  }) => {
    const form = q.form("Address");
    const birthPlace = q.combobox("Birth place");

    await birthPlace.fill("San Diego");
    await birthPlace.press("Escape");
    await form.evaluate((element) => {
      (element as HTMLFormElement).reset();
    });

    await test.expect(birthPlace).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("preserves the value when form reset is canceled", async ({ q }) => {
    const form = q.form("Canceled address");
    const name = q.textbox("Canceled name");
    const homeTown = q.combobox("Canceled home town");

    await name.fill("Chance");
    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Cancel address reset").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(name).toHaveValue("Chance");
    await test.expect(homeTown).toHaveValue("Boston");
  });
});
