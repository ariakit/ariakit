import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getButton = (name: string) => getByRole("button", { name });

function getDialog(name: string) {
  return queryByRole("dialog", {
    hidden: true,
    name: (accessibleName, element) => {
      if (accessibleName) return accessibleName === name;
      const labelledBy = element.getAttribute("aria-labelledby");
      if (!labelledBy) return false;
      const label = document.getElementById(labelledBy);
      if (!label) return false;
      return label.textContent === name;
    },
  });
}

function getBackdrop(name: string) {
  const dialog = getDialog(name);
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

function expectAccessibleDialog(name: string, toBeAccessible: boolean) {
  if (toBeAccessible) {
    expect(getDialog(name)).toBeVisible();
  } else {
    expect(queryByRole("dialog", { name })).not.toBeInTheDocument();
  }
}

test("show dialog and hide with escape", async () => {
  expect(getDialog("Dialog")).not.toBeInTheDocument();
  expectModalStyle(false);
  await click(getButton("Open dialog"));
  expect(getDialog("Dialog")).toBeVisible();
  expect(getButton("Close")).toHaveFocus();
  expectModalStyle(true);
  await press.Escape();
  expect(getDialog("Dialog")).not.toBeInTheDocument();
  expect(getButton("Open dialog")).toHaveFocus();
  expectModalStyle(false);
});

test.each(["nested", "sibling"])(
  "show %s dialog and hide with escape",
  async (name) => {
    await click(getButton("Open dialog"));
    await click(getButton(name));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(name, true);
    expectModalStyle(true);
    await click(getButton(`${name} ${name}`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getDialog(name)).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(name, false);
    expectAccessibleDialog(`${name} ${name}`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} ${name}`)).not.toBeVisible();
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton(`${name} ${name}`)).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(name, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(name)).not.toBeVisible();
    expect(getButton(name)).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog("Dialog")).not.toBeInTheDocument();
    expect(getButton("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  }
);

test.each(["nested", "sibling"])(
  "show %s unmount dialog and hide with escape",
  async (name) => {
    await click(getButton("Open dialog"));
    await click(getButton(`${name} unmount`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(`${name} unmount`, true);
    expectModalStyle(true);
    await click(getButton(`${name} unmount ${name}`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getDialog(`${name} unmount`)).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(`${name} unmount`, false);
    expectAccessibleDialog(`${name} unmount ${name}`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} unmount ${name}`)).not.toBeInTheDocument();
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton(`${name} unmount ${name}`)).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(`${name} unmount`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} unmount`)).not.toBeInTheDocument();
    expect(getButton(`${name} unmount`)).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog("Dialog")).not.toBeInTheDocument();
    expect(getButton("Open dialog")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectModalStyle(false);
  }
);

test.each(["nested", "sibling"])(
  "show %s no portal dialog and hide with escape",
  async (name) => {
    await click(getButton("Open dialog"));
    await click(getButton(`${name} no portal`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal`, true);
    expectModalStyle(true);
    await click(getButton(`${name} no portal ${name}`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getDialog(`${name} no portal`)).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal`, true);
    expectAccessibleDialog(`${name} no portal ${name}`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} no portal ${name}`)).not.toBeVisible();
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton(`${name} no portal ${name}`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal ${name}`)).not.toBeVisible();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} no portal`)).not.toBeVisible();
    expect(getButton(`${name} no portal`)).toHaveFocus();
    expect(getBackdrop(`${name} no portal`)).not.toBeVisible();
    expectAccessibleDialog("Dialog", true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog("Dialog")).not.toBeInTheDocument();
    expect(getButton("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  }
);

test.each(["nested", "sibling"])(
  "show %s no portal portal dialog and hide with escape",
  async (name) => {
    await click(getButton("Open dialog"));
    await click(getButton(`${name} no portal portal`));
    expect(getButton("Close")).toHaveFocus();
    await press.ShiftTab();
    await press.ShiftTab();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal portal`, true);
    expectModalStyle(true);
    await click(getButton(`${name} no portal portal ${name}`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getDialog(`${name} no portal portal`)).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal portal`, true);
    expectAccessibleDialog(`${name} no portal portal ${name}`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} no portal portal ${name}`)).not.toBeVisible();
    expect(getButton(`${name} no portal portal ${name}`)).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectAccessibleDialog(`${name} no portal portal`, true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog(`${name} no portal portal`)).not.toBeVisible();
    expect(getButton(`${name} no portal portal`)).toHaveFocus();
    expectAccessibleDialog("Dialog", true);
    expectModalStyle(true);
    await press.Escape();
    expect(getDialog("Dialog")).not.toBeInTheDocument();
    expect(getButton("Open dialog")).toHaveFocus();
    expectModalStyle(false);
  }
);

test.each(["nested", "sibling"])(
  "show %s no backdrop dialog and hide by clicking outside",
  async (name) => {
    await click(getButton("Open dialog"));
    await click(getButton(`${name} no backdrop`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(`${name} no backdrop`, true);
    expectModalStyle(true);
    await click(getButton(`${name} no backdrop ${name}`));
    expect(getDialog("Dialog")).toBeVisible();
    expect(getDialog(`${name} no backdrop`)).toBeVisible();
    expect(getButton("Close")).toHaveFocus();
    expectAccessibleDialog("Dialog", false);
    expectAccessibleDialog(`${name} no backdrop`, false);
    expectAccessibleDialog(`${name} no backdrop ${name}`, true);
    expectModalStyle(true);
    await click(document.body);
    expect(getDialog("Dialog")).not.toBeInTheDocument();
    expect(getButton("Open dialog")).toHaveFocus();
    expect(expectAccessibleDialog(`${name} no backdrop ${name}`, false));
    expect(expectAccessibleDialog(`${name} no backdrop`, false));
    expectModalStyle(false);
  }
);
