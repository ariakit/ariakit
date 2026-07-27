import { click, dispatch, focus, q } from "@ariakit/test";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("public-select", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select"));
  });

  // examples/select/test.ts
  test("opens with the selected item and commits another option", async () => {
    const select = q.combobox("Standard favorite fruit");
    expect(select).toHaveTextContent("Apple");
    await click(select);
    expect(q.option("Apple")).toHaveFocus();
    expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
    await click(q.option("Banana"));
    expect(q.listbox()).not.toBeInTheDocument();
    expect(select).toHaveTextContent("Banana");
  });
});

describe("public-select-multiple", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-multiple"));
  });

  // examples/select-multiple/test.ts
  test("keeps the list open while toggling multiple values", async () => {
    const select = q.combobox("Multiple favorite food");
    expect(select).toHaveTextContent("2 food selected");
    await click(select);
    await click(q.option("Chocolate"));
    expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "true");
    expect(q.listbox()).toBeVisible();
    expect(select).toHaveTextContent("3 food selected");
  });
});

describe("public-select-form", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-form"));
  });

  // examples/select-form/test.ts
  test("submits the legacy Select value through its native control", async () => {
    using alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    await click(q.button("Submit legacy select form"));
    expect(alert).toHaveBeenCalledWith("Apple");
    await click(q.combobox("Form favorite fruit"));
    await click(q.option("Orange"));
    await click(q.button("Submit legacy select form"));
    expect(alert).toHaveBeenLastCalledWith("Orange");
  });
});

describe("public-select-autofill", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-autofill"));
  });

  const getNativeSelect = () =>
    q.labeled("Legacy role", { selector: "select" });

  // examples/select-autofill/test.ts
  test("mirrors native autofill and redirects native focus", async () => {
    const select = q.combobox("Legacy role");
    await dispatch.change(getNativeSelect(), { target: { value: "Tutor" } });
    expect(select).toHaveAttribute("data-autofill");
    expect(select).toHaveTextContent("Tutor");
    await focus(getNativeSelect());
    await expect.poll(() => select).toHaveFocus();
  });
});

describe("public-select-form-disabled", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-form-disabled"));
  });

  // examples/select-form-disabled/test.ts
  test("is disabled and omits its value from form submission", async () => {
    using alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const select = q.combobox("Disabled favorite fruit");
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute("aria-disabled", "true");
    await click(select);
    expect(q.listbox()).not.toBeInTheDocument();
    await click(q.button("Submit disabled legacy select"));
    expect(alert).toHaveBeenCalledWith(null);
  });
});

describe("public-select-items-unmount", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-items-unmount"));
  });

  // examples/select-items-unmount/test.ts
  test("restores registered items after the popover unmounts", async () => {
    const select = q.combobox("Unmounting favorite fruit");
    await click(select);
    await click(q.option("Banana"));
    expect(q.listbox()).not.toBeInTheDocument();
    await click(select);
    expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  });
});

describe("public-select-default-open-controlled", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-default-open-controlled"));
  });

  // examples/select-default-open-controlled/test.ts
  test("lets the controlled popover toggle from its initial open state", async () => {
    const select = q.combobox("Default-open favorite fruit");
    expect(q.listbox()).toBeVisible();
    await click(select);
    expect(q.listbox()).not.toBeInTheDocument();
    await click(select);
    expect(q.listbox()).toBeVisible();
  });
});
