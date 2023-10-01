import { version } from "react";
import { click, press, q, waitFor } from "@ariakit/test";

const is17 = version.startsWith("17");

describe.skipIf(is17)("menu-framer-motion", () => {
  test("show/hide on click", async () => {
    expect(q.menu()).not.toBeInTheDocument();
    await click(q.button("Options"));
    expect(q.menu()).toBeVisible();
    expect(q.menu()).toHaveFocus();
    await click(q.button("Options"));
    expect(q.button("Options")).toHaveFocus();
    expect(q.menu()).toBeVisible();
    await waitFor(() => expect(q.menu()).not.toBeInTheDocument());
  });

  test("show/hide on enter", async () => {
    expect(q.menu()).not.toBeInTheDocument();
    await press.Tab();
    await press.Enter();
    expect(q.menu()).toBeVisible();
    expect(q.menuitem("Edit")).toHaveFocus();
    await press.ShiftTab();
    await press.Enter();
    expect(q.button("Options")).toHaveFocus();
    expect(q.menu()).toBeVisible();
    await waitFor(() => expect(q.menu()).not.toBeInTheDocument());
  });

  test("show/hide on space", async () => {
    expect(q.menu()).not.toBeInTheDocument();
    await press.Tab();
    await press.Space();
    expect(q.menu()).toBeVisible();
    expect(q.menuitem("Edit")).toHaveFocus();
    await press.ShiftTab();
    await press.Space();
    expect(q.button("Options")).toHaveFocus();
    expect(q.menu()).toBeVisible();
    await waitFor(() => expect(q.menu()).not.toBeInTheDocument());
  });

  test("hide on esc", async () => {
    expect(q.menu()).not.toBeInTheDocument();
    await click(q.button("Options"));
    await press.Escape();
    expect(q.button("Options")).toHaveFocus();
    expect(q.menu()).toBeVisible();
    await waitFor(() => expect(q.menu()).not.toBeInTheDocument());
  });

  test("hide on click outside", async () => {
    expect(q.menu()).not.toBeInTheDocument();
    await click(q.button("Options"));
    await click(document.body);
    expect(q.button("Options")).toHaveFocus();
    expect(q.menu()).toBeVisible();
    await waitFor(() => expect(q.menu()).not.toBeInTheDocument());
  });
});
