import * as ak from "@ariakit/react";
import { click, press, q, waitFor } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Example from "./index.react.tsx";

const content = () => q.text(/Create an account/);

function SharedStoreDisclosures() {
  const store = ak.useDisclosureStore();
  return createElement(
    "div",
    null,
    createElement(ak.Disclosure, { store }, "Shared first"),
    createElement(ak.Disclosure, { store }, "Shared second"),
  );
}

function ReclaimDisconnectedDisclosure() {
  const [firstMounted, setFirstMounted] = useState(true);
  const store = ak.useDisclosureStore();
  return createElement(
    "div",
    null,
    firstMounted &&
      createElement(ak.Disclosure, { store }, "Disconnected first"),
    createElement(ak.Disclosure, { store }, "Disconnected second"),
    createElement("button", { onClick: store.hide }, "Hide shared"),
    createElement(
      "button",
      { onClick: () => setFirstMounted(false) },
      "Unmount shared first",
    ),
    createElement("button", { onClick: store.show }, "Show shared"),
  );
}

test("renders default open disclosure as expanded on server", () => {
  const html = renderToStaticMarkup(createElement(Example));
  expect(html).toContain('aria-expanded="true"');
});

test("marks only the active shared-store disclosure as expanded", async () => {
  const { unmount } = await render(createElement(SharedStoreDisclosures));
  try {
    const firstDisclosure = q.button("Shared first");
    const secondDisclosure = q.button("Shared second");

    expect(q.button.all(/^Shared /)).toHaveLength(2);

    await click(firstDisclosure);
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "true");
    expect(secondDisclosure).toHaveAttribute("aria-expanded", "false");

    await click(secondDisclosure);
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "false");
    expect(secondDisclosure).toHaveAttribute("aria-expanded", "false");

    await click(secondDisclosure);
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "false");
    expect(secondDisclosure).toHaveAttribute("aria-expanded", "true");
  } finally {
    unmount();
  }
});

test("reclaims disconnected disclosure element on programmatic open", async () => {
  const { unmount } = await render(
    createElement(ReclaimDisconnectedDisclosure),
  );
  try {
    const firstDisclosure = q.button("Disconnected first");
    const secondDisclosure = q.button("Disconnected second");

    await click(firstDisclosure);
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "true");
    expect(secondDisclosure).toHaveAttribute("aria-expanded", "false");

    await click(q.button("Hide shared"));
    expect(firstDisclosure).toHaveAttribute("aria-expanded", "false");
    expect(secondDisclosure).toHaveAttribute("aria-expanded", "false");

    await click(q.button("Unmount shared first"));
    expect(q.button("Disconnected first")).not.toBeInTheDocument();

    await click(q.button("Show shared"));
    await waitFor(() => {
      expect(secondDisclosure).toHaveAttribute("aria-expanded", "true");
    });
  } finally {
    unmount();
  }
});

test("show/hide on click", async () => {
  expect(content()).toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "true");
  await click(q.button());
  expect(content()).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(content()).not.toBeVisible();
  await press.Enter();
  expect(content()).toBeVisible();
});

test("show/hide on space", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Space();
  expect(content()).not.toBeVisible();
  await press.Space();
  expect(content()).toBeVisible();
});
