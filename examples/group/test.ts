import { Button, Group, GroupLabel } from "@ariakit/react";
import { click, q } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement, useState } from "react";
import { expect, test } from "vitest";

test("markup", () => {
  expect(q.group()).toMatchInlineSnapshot(`
    <div
      class="group"
      role="group"
    >
      <button
        class="button"
        type="button"
      >
        Bold
      </button>
      <button
        class="button"
        type="button"
      >
        Italic
      </button>
      <button
        class="button"
        type="button"
      >
        Underline
      </button>
    </div>
  `);
});

test("sets aria-labelledby from group label", async () => {
  const { unmount } = await render(
    createElement(
      Group,
      null,
      createElement(GroupLabel, null, "Formatting"),
      createElement(Button, null, "Bold"),
    ),
    { strictMode: true },
  );

  try {
    const group = q.group.ensure("Formatting");
    const label = q.text.ensure("Formatting");

    expect(group).toHaveAttribute("aria-labelledby", label.id);
  } finally {
    unmount();
  }
});

test("gives precedence to aria-label", async () => {
  const { unmount } = await render(
    createElement(
      Group,
      { "aria-label": "Toolbar" },
      createElement(GroupLabel, null, "Formatting"),
      createElement(Button, null, "Bold"),
    ),
    { strictMode: true },
  );

  try {
    expect(q.group.ensure("Toolbar")).not.toHaveAttribute("aria-labelledby");
  } finally {
    unmount();
  }
});

test("updates aria-labelledby when group label changes", async () => {
  function TestGroup() {
    const [labelId, setLabelId] = useState("formatting");
    const [showLabel, setShowLabel] = useState(true);

    return createElement(
      Group,
      null,
      showLabel && createElement(GroupLabel, { id: labelId }, "Formatting"),
      createElement(
        Button,
        { onClick: () => setLabelId("formatting-updated") },
        "Change label id",
      ),
      createElement(
        Button,
        { onClick: () => setShowLabel(false) },
        "Hide label",
      ),
    );
  }

  const { unmount } = await render(createElement(TestGroup), {
    strictMode: true,
  });

  try {
    const group = q.group.ensure("Formatting");

    expect(group).toHaveAttribute("aria-labelledby", "formatting");

    await click(q.button("Change label id"));
    expect(group).toHaveAttribute("aria-labelledby", "formatting-updated");

    await click(q.button("Hide label"));
    expect(group).not.toHaveAttribute("aria-labelledby");
  } finally {
    unmount();
  }
});
