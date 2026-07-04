import { click, dispatch, press, q, sleep } from "@ariakit/test";
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

test("disables the outside tree before paint without scrollbar-gutter support", async () => {
  // happy-dom's window.CSS getter returns a fresh object on every access, so
  // the getter itself must be mocked rather than a single instance's method.
  const unsupportedCSS: Pick<typeof CSS, "supports"> = {
    supports: () => false,
  };
  using _supports = vi
    .spyOn(window, "CSS", "get")
    .mockReturnValue(unsupportedCSS as typeof CSS);
  // Without scrollbar-gutter support, the scroll lock is about to write the
  // --scrollbar-width property that invalidates the whole document before
  // paint, so the dialog disables the outside tree synchronously to share
  // that pass instead of deferring it. dispatch.click fires a single event
  // without settling, so no animation frames have run when we assert.
  await dispatch.click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(document.querySelector("[inert]")).not.toBeNull();
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(document.querySelector("[inert]")).toBeNull();
});

test("closing before the deferred disable leaves no inert behind", async () => {
  // dispatch.click fires a single event without settling, so no animation
  // frames run between the open and close below: the close happens while the
  // outside-tree disabling is still scheduled for the frame after the open
  // paint.
  await dispatch.click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  // The deferred path applies: the outside tree is not inert yet.
  expect(document.querySelector("[inert]")).toBeNull();
  await dispatch.click(q.button("Close"));
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  // Let the frames the dialog canceled elapse: the deferred disable must not
  // fire after the dialog closed.
  await sleep(50);
  expect(document.querySelector("[inert]")).toBeNull();
});

test("outside tree stays disabled when a sibling dialog takes over", async () => {
  // happy-dom reports scrollbar-gutter support, so the sync fallback probe
  // doesn't apply and the dialog takes the deferred path where the inert
  // writes land right after the open frame paints, exercising the
  // synchronous re-apply handoff below.
  await click(q.button("Open dialog"));
  const inertRoot = document.querySelector("[inert]");
  expect(inertRoot).not.toBeNull();
  if (!inertRoot) return;
  // The closing dialog restores the outside tree synchronously, and the
  // opening sibling must re-disable it in the same task. We record the inert
  // state at every mutation delivery (a microtask checkpoint) to catch a
  // handoff that leaves the tree enabled until a later frame.
  const inertValues: boolean[] = [];
  const observer = new MutationObserver(() => {
    inertValues.push(inertRoot.hasAttribute("inert"));
  });
  observer.observe(inertRoot, {
    attributes: true,
    attributeFilter: ["inert"],
  });
  await click(q.button("sibling dismiss unmount"));
  observer.disconnect();
  expect(q.dialog("sibling dismiss unmount")).toBeVisible();
  expect(inertRoot.hasAttribute("inert")).toBe(true);
  expect(inertValues.every((inert) => inert)).toBe(true);
});

test("scroll stays locked when a sibling dialog takes over", async () => {
  await click(q.button("Open dialog"));
  expectModalStyle(true);
  // The closing dialog defers its scroll unlock to a microtask while the
  // opening dialog locks synchronously, so we watch every style change on the
  // html element during the handoff to catch a transient unlock between the
  // two.
  const overflowValues: string[] = [];
  const observer = new MutationObserver(() => {
    overflowValues.push(document.documentElement.style.overflowY);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
  });
  await click(q.button("sibling dismiss unmount"));
  observer.disconnect();
  expect(q.dialog("sibling dismiss unmount")).toBeVisible();
  expectModalStyle(true);
  expect(overflowValues.every((overflow) => overflow === "hidden")).toBe(true);
});

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
