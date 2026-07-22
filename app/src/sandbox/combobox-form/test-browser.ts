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
  test("resets an uncontrolled combobox with its form", async ({ q }) => {
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");

    await name.fill("Chance");
    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset address").click();

    await test.expect(name).toHaveValue("");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633990062
  test("resets when Window capture stops propagation", async ({ q }) => {
    const form = q.form("Address");
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");
    await form.evaluate(() => {
      window.addEventListener("reset", (event) => event.stopPropagation(), {
        capture: true,
        once: true,
      });
    });

    await name.fill("Chance");
    await homeTown.fill("Boston");
    await q.button("Reset address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(name).toHaveValue("");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633612920
  test("ignores a standalone reset event", async ({ q }) => {
    const form = q.form("Address");
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");

    await name.fill("Chance");
    await homeTown.fill("Boston");
    const values = await form.evaluate(async (element) => {
      const form = element as HTMLFormElement;
      const read = () => ({
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        homeTown: (form.elements.namedItem("homeTown") as HTMLInputElement)
          .value,
        formHomeTown: new FormData(form).get("homeTown"),
      });
      form.dispatchEvent(
        new Event("reset", { bubbles: true, cancelable: true }),
      );
      const immediate = read();
      await new Promise((resolve) => setTimeout(resolve));
      return { immediate, nextTask: read() };
    });

    const expected = {
      name: "Chance",
      homeTown: "Boston",
      formHomeTown: "Boston",
    };
    test.expect(values).toEqual({ immediate: expected, nextTask: expected });
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("resets the form value before reset returns", async ({ q }) => {
    const form = q.form("Address");
    const homeTown = q.combobox("Home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      form.reset();
      return new FormData(form).get("homeTown");
    });

    test.expect(value).toBe("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("submits the reset value in the same task", async ({ q }) => {
    const form = q.form("Address");
    const homeTown = q.combobox("Home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      return new Promise<string | null>((resolve) => {
        form.addEventListener(
          "submit",
          (event) => {
            event.preventDefault();
            const value = new FormData(form).get("homeTown");
            resolve(typeof value === "string" ? value : null);
          },
          { once: true },
        );
        form.reset();
        form.requestSubmit();
      });
    });

    test.expect(value).toBe("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
  for (const label of ["Effect", "Layout effect", "Render effect"]) {
    test(`resets synchronously from ${label}`, async ({ q }) => {
      const form = q.form(`${label} address`);
      const homeTown = q.combobox(`${label} home town`);

      await homeTown.fill("Boston");
      await q.button(`Reset ${label.toLowerCase()} address`).click();

      await test.expect(form).toHaveAttribute("data-after-reset", "");
      await test.expect(form).toHaveAttribute("data-on-submit", "");
      await test.expect(homeTown).toHaveValue("");
    });
  }

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
  test("resets a pass-through render with setValueOnChange disabled", async ({
    q,
  }) => {
    const form = q.form("Programmatic render effect address");
    const homeTown = q.combobox("Programmatic render effect home town");

    await q.button("Reset programmatic render effect address").click();

    await test.expect(form).toHaveAttribute("data-after-reset", "");
    await test.expect(form).toHaveAttribute("data-on-submit", "");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633612921
  test("rebinds the reset listener when render replaces the element", async ({
    q,
  }) => {
    const form = q.form("Replaced address");
    const homeTown = q.combobox("Replaced home town");

    await homeTown.fill("Boston");
    await q.button("Replace and reset address").click();

    test
      .expect(await homeTown.evaluate((element) => element.tagName))
      .toBe("TEXTAREA");
    await test.expect(form).toHaveAttribute("data-after-reset", "");
    test
      .expect(
        await form.evaluate((element) =>
          new FormData(element as HTMLFormElement).get("replacedHomeTown"),
        ),
      )
      .toBe("");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("preserves a value set after reset in the same task", async ({ q }) => {
    const form = q.form("Address");
    const homeTown = q.combobox("Home town");

    await homeTown.fill("Boston");
    await q.button("Reset and replace address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Paris");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("resets when reset event propagation is stopped", async ({ q }) => {
    const form = q.form("Address");
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");
    await form.evaluate((element) => {
      element.addEventListener("reset", (event) => event.stopPropagation(), {
        once: true,
      });
    });

    await name.fill("Chance");
    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset address").click();

    await test.expect(name).toHaveValue("");
    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("does not overwrite a replacement after propagation stops", async ({
    q,
  }) => {
    const form = q.form("Address");
    const homeTown = q.combobox("Home town");
    await form.evaluate((element) => {
      element.addEventListener("reset", (event) => event.stopPropagation(), {
        once: true,
      });
    });

    await homeTown.fill("Boston");
    await q.button("Reset and replace address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Paris");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("resets a combobox to its default value", async ({ q }) => {
    const birthPlace = q.combobox("Birth place");

    await birthPlace.fill("San Diego");
    await birthPlace.press("Escape");
    await q.button("Reset address").click();

    await test.expect(birthPlace).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("uses the store reset value when the input has a defaultValue prop", async ({
    q,
  }) => {
    await q.button("Show default value prop address").click();
    const form = q.form("Default value prop address");
    const homeTown = q.combobox("Default value prop home town");

    for (const value of ["Boston", "Madrid"]) {
      await homeTown.fill(value);
      const resetValues = await form.evaluate((element) => {
        const form = element as HTMLFormElement;
        const input = form.elements.namedItem(
          "defaultValuePropHomeTown",
        ) as HTMLInputElement;
        form.reset();
        return {
          form: new FormData(form).get("defaultValuePropHomeTown"),
          input: input.value,
          defaultValue: input.defaultValue,
        };
      });

      test.expect(resetValues).toEqual({
        form: "London",
        input: "London",
        defaultValue: "London",
      });
    }
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("resets a combobox associated with an explicit form", async ({ q }) => {
    const formerHomeTown = q.combobox("Former home town");

    await formerHomeTown.fill("Boston");
    await formerHomeTown.press("Escape");
    await q.button("Reset address").click();

    await test.expect(formerHomeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("resets synchronously inside a shadow root", async ({ q }) => {
    const form = q.form("Shadow address");
    const homeTown = q.combobox("Shadow home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      form.reset();
      return new FormData(form).get("shadowHomeTown");
    });

    test.expect(value).toBe("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633612920
  test("ignores a standalone reset event inside a shadow root", async ({
    q,
  }) => {
    const form = q.form("Shadow address");
    const homeTown = q.combobox("Shadow home town");

    await homeTown.fill("Boston");
    const values = await form.evaluate(async (element) => {
      const form = element as HTMLFormElement;
      const read = () => new FormData(form).get("shadowHomeTown");
      form.dispatchEvent(
        new Event("reset", { bubbles: true, cancelable: true }),
      );
      const immediate = read();
      await new Promise((resolve) => setTimeout(resolve));
      return { immediate, nextTask: read() };
    });

    test.expect(values).toEqual({ immediate: "Boston", nextTask: "Boston" });
    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("preserves a canceled reset inside a shadow root", async ({ q }) => {
    const form = q.form("Shadow address");
    const homeTown = q.combobox("Shadow home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate(async (element) => {
      const form = element as HTMLFormElement;
      const root = form.getRootNode();
      root.addEventListener("reset", (event) => event.preventDefault(), {
        once: true,
      });
      form.reset();
      await new Promise((resolve) => setTimeout(resolve));
      return new FormData(form).get("shadowHomeTown");
    });

    test.expect(value).toBe("Boston");
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

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("preserves the value when a Document listener cancels reset", async ({
    q,
  }) => {
    const form = q.form("Address");
    const name = q.textbox("Name");
    const homeTown = q.combobox("Home town");

    await name.fill("Chance");
    await homeTown.fill("Boston");
    const values = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      document.addEventListener("reset", (event) => event.preventDefault(), {
        once: true,
      });
      form.reset();
      return {
        name: new FormData(form).get("name"),
        homeTown: new FormData(form).get("homeTown"),
      };
    });

    test.expect(values).toEqual({ name: "Chance", homeTown: "Boston" });
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("preserves the value when a Window listener cancels reset", async ({
    q,
  }) => {
    const form = q.form("Address");
    const homeTown = q.combobox("Home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate(async (element) => {
      const form = element as HTMLFormElement;
      window.addEventListener("reset", (event) => event.preventDefault(), {
        once: true,
      });
      form.reset();
      await new Promise((resolve) => setTimeout(resolve));
      return new FormData(form).get("homeTown");
    });

    test.expect(value).toBe("Boston");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("preserves a controlled value on form reset", async ({ q }) => {
    const homeTown = q.combobox("Controlled home town");

    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset controlled address").click();

    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("preserves a caller-controlled element value on form reset", async ({
    q,
  }) => {
    const form = q.form("Controlled element address");
    const homeTown = q.combobox("Controlled element home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      form.reset();
      return new FormData(form).get("controlledElementHomeTown");
    });

    test.expect(value).toBe("Boston");
    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
  test("preserves an equal caller-controlled render function value", async ({
    q,
  }) => {
    const form = q.form("Controlled function address");
    const homeTown = q.combobox("Controlled function home town");

    await homeTown.fill("Boston");
    const value = await form.evaluate((element) => {
      const form = element as HTMLFormElement;
      form.reset();
      return new FormData(form).get("controlledFunctionHomeTown");
    });

    test.expect(value).toBe("Boston");
    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
  test("does not overwrite a controlled render after propagation stops", async ({
    q,
  }) => {
    const form = q.form("Controlled element address");
    const homeTown = q.combobox("Controlled element home town");
    await form.evaluate((element) => {
      element.addEventListener("reset", (event) => event.stopPropagation(), {
        once: true,
      });
    });

    await homeTown.fill("Boston");
    await q.button("Reset and replace controlled element address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Boston");
    const value = await form.evaluate((element) =>
      new FormData(element as HTMLFormElement).get("controlledElementHomeTown"),
    );
    test.expect(value).toBe("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
  test("preserves a value controlled by a composed store", async ({ q }) => {
    const form = q.form("Controlled store address");
    const homeTown = q.combobox("Controlled store home town");

    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset controlled store address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
  test("preserves a value controlled by a sibling store", async ({ q }) => {
    const form = q.form("Sibling controlled store address");
    const homeTown = q.combobox("Sibling controlled store home town");

    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset sibling controlled store address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
  test("resets a value not owned by a partially shared store", async ({
    q,
  }) => {
    const homeTown = q.combobox("Partially shared home town");

    await homeTown.fill("Boston");
    await q.button("Reset partially shared address").click();

    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
  test("preserves a value controlled by a tag store", async ({ q }) => {
    const form = q.form("Controlled tag address");
    const homeTown = q.combobox("Controlled tag home town");

    await homeTown.fill("Boston");
    await homeTown.press("Escape");
    await q.button("Reset controlled tag address").click();
    await form.evaluate(
      () => new Promise<void>((resolve) => setTimeout(resolve)),
    );

    await test.expect(homeTown).toHaveValue("Boston");
    await test.expect(form).toHaveAttribute("data-value-changes", "[]");
  });

  // https://github.com/ariakit/ariakit/issues/1861
  test("clears inline autocomplete on form reset", async ({ q }) => {
    const form = q.form("Inline address");
    const homeTown = q.combobox("Inline home town");

    await homeTown.click();
    await homeTown.pressSequentially("B");
    await test.expect(homeTown).toHaveValue("Boston");
    await form.evaluate(async (element) => {
      (element as HTMLFormElement).reset();
      await new Promise((resolve) => setTimeout(resolve));
    });

    await test.expect(homeTown).toHaveValue("");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060250
  test("restores inline autocomplete when reopening", async ({ q }) => {
    const homeTown = q.combobox("Inline auto select home town");

    await homeTown.click();
    await test.expect(homeTown).toHaveValue("Boston");
    await homeTown.press("Escape");
    await q.button("Reset inline address").click();
    await test.expect(homeTown).toHaveValue("");
    await homeTown.click();

    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633612916
  test("restores inline autocomplete when reopening with the keyboard", async ({
    q,
  }) => {
    const homeTown = q.combobox("Inline auto select home town");

    await homeTown.click();
    await test.expect(homeTown).toHaveValue("Boston");
    await homeTown.press("Escape");
    await q.button("Reset inline address").click();
    await test.expect(homeTown).toHaveValue("");
    await homeTown.press("ArrowDown");

    await test.expect(homeTown).toHaveValue("Boston");
  });

  // https://github.com/ariakit/ariakit/pull/6803#discussion_r3633612916
  test("restores inline autocomplete when the store reopens", async ({ q }) => {
    const homeTown = q.combobox("Inline auto select home town");

    await homeTown.click();
    await test.expect(homeTown).toHaveValue("Boston");
    await homeTown.press("Escape");
    await q.button("Reset inline address").click();
    await test.expect(homeTown).toHaveValue("");
    await q.button("Show inline address").click();

    await test.expect(homeTown).toHaveValue("Boston");
  });
});
