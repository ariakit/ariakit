import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

function getBackdrop(name: string) {
  const dialog = q.dialog.hidden(name);
  const selector = `[data-backdrop="${dialog?.id}"]`;
  return document.querySelector<HTMLElement>(selector);
}

function expectModalStyle(toHaveStyle: boolean) {
  const { documentElement, body } = document;
  const prop = toHaveStyle ? "itself" : "not";
  expect(documentElement)[prop].toHaveStyle("scrollbar-gutter: stable");
  expect(documentElement)[prop].toHaveStyle("overflow-x: hidden");
  expect(documentElement)[prop].toHaveStyle("overflow-y: hidden");
  // The scrollbar-gutter lock neither defines --scrollbar-width nor touches
  // the body styles.
  expect(documentElement).not.toHaveStyle("--scrollbar-width: 1024px");
  expect(body).not.toHaveStyle("overflow: hidden");
  expect(body).not.toHaveStyle("padding-right: 1024px");
}

test("show dialog and hide with escape", async () => {
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expectModalStyle(false);
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.button("Close")).toHaveFocus();
  expectModalStyle(true);
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(q.button("Open dialog")).toHaveFocus();
  expectModalStyle(false);
});

test("fall back to body padding without scrollbar-gutter support", async () => {
  const { documentElement, body } = document;
  // happy-dom's window.CSS getter returns a fresh object on every access, so
  // the getter itself must be mocked rather than a single instance's method.
  const unsupportedCSS: Pick<typeof CSS, "supports"> = {
    supports: () => false,
  };
  using _supports = vi
    .spyOn(window, "CSS", "get")
    .mockReturnValue(unsupportedCSS as typeof CSS);
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(documentElement).toHaveStyle("--scrollbar-width: 1024px");
  expect(documentElement).not.toHaveStyle("scrollbar-gutter: stable");
  // The html overflow is visible here, so the fallback must leave the html
  // element's overflow alone and lock the body only.
  expect(documentElement).not.toHaveStyle("overflow-y: hidden");
  expect(body).toHaveStyle("overflow: hidden");
  expect(body).toHaveStyle("padding-right: 1024px");
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(documentElement).not.toHaveStyle("--scrollbar-width: 1024px");
  expect(body).not.toHaveStyle("overflow: hidden");
  expect(body).not.toHaveStyle("padding-right: 1024px");
});

test.each(["nested", "sibling"])(
  "show %s dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(name));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(name)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} ${name}`));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.dialog.hidden(name)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(name)).not.toBeInTheDocument();
    expect(q.dialog(`${name} ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} ${name}`)).not.toBeVisible();
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.button(`${name} ${name}`)).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(name)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(name)).not.toBeVisible();
    expect(q.button(name)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
  10000,
);

test.each(["nested", "sibling"])(
  "show %s unmount dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} unmount`));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} unmount ${name}`));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.dialog.hidden(`${name} unmount`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} unmount ${name}`)).not.toBeInTheDocument();
    expect(q.button(`${name} unmount ${name}`)).toHaveFocus();
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} unmount`)).not.toBeInTheDocument();
    expect(q.button(`${name} unmount`)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
  10000,
);

test.each(["nested", "sibling"])(
  "show %s no portal dialog and hide with escape",
  async (name) => {
    const maybeNoRole = name === "nested" ? q.none.hidden : q.dialog.hidden;
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no portal`));
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no portal ${name}`));
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(maybeNoRole(`${name} no portal`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(maybeNoRole(`${name} no portal`)).toBeVisible();
    expect(q.dialog(`${name} no portal ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} no portal ${name}`)).not.toBeVisible();
    expect(q.button(`${name} no portal ${name}`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal ${name}`)).not.toBeVisible();
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} no portal`)).not.toBeVisible();
    expect(q.button(`${name} no portal`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal`)).not.toBeVisible();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
  10000,
);

test.each(["nested", "sibling"])(
  "show %s no portal portal dialog and hide with escape",
  async (name) => {
    const maybeNoRole = name === "nested" ? q.none.hidden : q.dialog.hidden;
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no portal portal`));
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal portal`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no portal portal ${name}`));
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.dialog.hidden(`${name} no portal portal`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} no portal portal ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.hidden(`${name} no portal portal ${name}`),
    ).not.toBeVisible();
    expect(q.button(`${name} no portal portal ${name}`)).toHaveFocus();
    expect(maybeNoRole("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal portal`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.hidden(`${name} no portal portal`)).not.toBeVisible();
    expect(q.button(`${name} no portal portal`)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(maybeNoRole("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
  10000,
);

test.each(["nested", "sibling"])(
  "show %s no backdrop dialog and hide by clicking outside",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no backdrop`));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no backdrop ${name}`));
    expect(q.dialog.hidden("Dialog")).toBeVisible();
    expect(q.dialog.hidden(`${name} no backdrop`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop`)).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop ${name}`)).toBeVisible();
    expectModalStyle(true);
    await click(document.body);
    expect(q.dialog.hidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).not.toHaveFocus();
    expect(q.dialog(`${name} no backdrop ${name}`)).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop`)).not.toBeInTheDocument();
    expectModalStyle(false);
  },
);

test.each(["nested", "sibling"])(
  "show %s dismiss dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} dismiss`));
    await expect.poll(q.button.lazy("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss`)).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expectModalStyle(true);
    await click(q.button(`${name} dismiss ${name}`));
    await expect
      .poll(q.dialog.hidden.lazy(`${name} dismiss`))
      .not.toBeVisible();
    await expect.poll(q.button.lazy("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.button("Open dialog")).toHaveFocus();
    expect(q.dialog(`${name} dismiss ${name}`)).not.toBeInTheDocument();
    expectModalStyle(false);
  },
);

test.each(["sibling"])(
  "show %s dismiss unmount dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} dismiss unmount`));
    expect(q.dialog.hidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss unmount`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} dismiss unmount ${name}`));
    expect(q.dialog.hidden(`${name} dismiss unmount`)).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss unmount ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.hidden(`${name} dismiss unmount ${name}`),
    ).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);
