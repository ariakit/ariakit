import { click, press, q, waitFor } from "@ariakit/test";

function getBackdrop(name: string) {
  const dialog = q.dialog.includesHidden(name);
  const selector = `[data-backdrop="${dialog?.id}"]`;
  return document.querySelector<HTMLElement>(selector);
}

function expectModalStyle(toHaveStyle: boolean) {
  const { documentElement, body } = document;
  const prop = toHaveStyle ? "itself" : "not";
  expect(documentElement)[prop].toHaveStyle("--scrollbar-width: 1024px");
  expect(body)[prop].toHaveStyle("overflow: hidden");
  expect(body)[prop].toHaveStyle("padding-right: 1024px");
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

test.each(["nested", "sibling"])(
  "show %s dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(name));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(name)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} ${name}`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(name)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(name)).not.toBeInTheDocument();
    expect(q.dialog(`${name} ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden(`${name} ${name}`)).not.toBeVisible();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.button(`${name} ${name}`)).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(name)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden(name)).not.toBeVisible();
    expect(q.button(name)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);

test.each(["nested", "sibling"])(
  "show %s unmount dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} unmount`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} unmount ${name}`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(`${name} unmount`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.includesHidden(`${name} unmount ${name}`),
    ).not.toBeInTheDocument();
    expect(q.button(`${name} unmount ${name}`)).toHaveFocus();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} unmount`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden(`${name} unmount`)).not.toBeInTheDocument();
    expect(q.button(`${name} unmount`)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);

test.each(["nested", "sibling"])(
  "show %s no portal dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no portal`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no portal ${name}`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(`${name} no portal`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(`${name} no portal`)).toBeVisible();
    expect(q.dialog(`${name} no portal ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.includesHidden(`${name} no portal ${name}`),
    ).not.toBeVisible();
    expect(q.button(`${name} no portal ${name}`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal ${name}`)).not.toBeVisible();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden(`${name} no portal`)).not.toBeVisible();
    expect(q.button(`${name} no portal`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal`)).not.toBeVisible();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);

test.each(["nested", "sibling"])(
  "show %s no portal portal dialog and hide with escape",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no portal portal`));
    expect(q.button("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal portal`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no portal portal ${name}`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(`${name} no portal portal`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} no portal portal ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.includesHidden(`${name} no portal portal ${name}`),
    ).not.toBeVisible();
    expect(q.button(`${name} no portal portal ${name}`)).toHaveFocus();
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog(`${name} no portal portal`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.includesHidden(`${name} no portal portal`),
    ).not.toBeVisible();
    expect(q.button(`${name} no portal portal`)).toHaveFocus();
    expect(q.dialog("Dialog")).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(q.dialog.includesHidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);

test.each(["nested", "sibling"])(
  "show %s no backdrop dialog and hide by clicking outside",
  async (name) => {
    await click(q.button("Open dialog"));
    await click(q.button(`${name} no backdrop`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} no backdrop ${name}`));
    expect(q.dialog.includesHidden("Dialog")).toBeVisible();
    expect(q.dialog.includesHidden(`${name} no backdrop`)).toBeVisible();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop`)).not.toBeInTheDocument();
    expect(q.dialog(`${name} no backdrop ${name}`)).toBeVisible();
    expectModalStyle(true);
    await click(document.body);
    expect(q.dialog.includesHidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
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
    await waitFor(() => expect(q.button("Close")).toHaveFocus());
    expect(q.dialog(`${name} dismiss`)).toBeVisible();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expectModalStyle(true);
    await click(q.button(`${name} dismiss ${name}`));
    expect(q.dialog.includesHidden(`${name} dismiss`)).not.toBeVisible();
    await waitFor(() => expect(q.button("Close")).toHaveFocus());
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
    expect(q.dialog.includesHidden("Dialog")).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss unmount`)).toBeVisible();
    expectModalStyle(true);
    await click(q.button(`${name} dismiss unmount ${name}`));
    expect(
      q.dialog.includesHidden(`${name} dismiss unmount`),
    ).not.toBeInTheDocument();
    expect(q.button("Close")).toHaveFocus();
    expect(q.dialog(`${name} dismiss unmount ${name}`)).toBeVisible();
    expectModalStyle(true);
    await press.Escape();
    expect(
      q.dialog.includesHidden(`${name} dismiss unmount ${name}`),
    ).not.toBeInTheDocument();
    expect(q.button("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  },
);
