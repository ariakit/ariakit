import { click, dispatch, press, q } from "@ariakit/test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { DocumentRootDocument } from "./index.react.tsx";

async function withDocumentRoot(
  callback: (query: ReturnType<typeof q.within>) => Promise<void>,
) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  const frameDocument = iframe.contentDocument;
  if (!frameDocument) throw new Error("iframe document is not available");
  const root = createRoot(frameDocument);
  try {
    await act(async () => {
      root.render(createElement(DocumentRootDocument));
    });
    await callback(q.within(frameDocument.body));
  } finally {
    await act(async () => root.unmount());
    iframe.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
}

// https://github.com/ariakit/ariakit/issues/5179
test("lets a child handle Escape before the dialog", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.combobox("Search")).toHaveFocus();
  expect(q.listbox("Suggestions")).toBeVisible();

  await press.Escape();

  expect(q.listbox("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog("Dialog")).not.toBeInTheDocument();
});

test("hides before an outside ancestor handles Escape", async () => {
  await click(q.button("Open outer ancestor dialog"));
  expect(q.dialog("Outer ancestor dialog")).toBeVisible();
  expect(q.combobox("Search")).toHaveFocus();

  await press.Escape();

  expect(q.listbox("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Outer ancestor dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog("Outer ancestor dialog")).not.toBeInTheDocument();
});

test("lets an outside capture handler own Escape", async () => {
  await click(q.button("Open outer capture dialog"));
  const dialog = q.dialog("Outer capture dialog");
  const input = q.within(dialog).combobox.ensure("Search");
  const listbox = q.within(dialog).listbox("Suggestions");

  expect(dialog).toBeVisible();
  expect(input).toHaveFocus();
  expect(listbox).toBeVisible();

  await press.Escape(input);

  expect(listbox).toBeVisible();
  expect(dialog).toBeVisible();
});

test("hides after its own bubble handler stops Escape", async () => {
  await click(q.button("Open own bubble dialog"));
  expect(q.dialog("Own bubble dialog")).toBeVisible();

  await press.Escape();

  expect(q.listbox("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Own bubble dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog("Own bubble dialog")).not.toBeInTheDocument();
});

test("hides after its own capture handler stops Escape", async () => {
  await click(q.button("Open own capture dialog"));
  expect(q.dialog("Own capture dialog")).toBeVisible();

  await press.Escape(q.combobox.ensure("Search"));

  expect(q.dialog("Own capture dialog")).not.toBeInTheDocument();
});

test("hides on a non-bubbling Escape", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await dispatch.keyDown(q.combobox("Search"), {
    key: "Escape",
    bubbles: false,
    cancelable: true,
  });

  expect(q.dialog("Dialog")).not.toBeInTheDocument();
});

test("lets a child capture Escape in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root capture dialog"));
    const input = q.combobox.ensure("Search");
    expect(q.dialog("Document root capture dialog")).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await press.Escape(input);

    expect(q.listbox("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog("Document root capture dialog")).toBeVisible();

    await press.Escape(input);

    expect(q.dialog("Document root capture dialog")).not.toBeInTheDocument();
  });
});

test("hides after its own capture handler in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root own capture dialog"));
    const input = q.combobox.ensure("Search");
    expect(q.dialog("Document root own capture dialog")).toBeVisible();

    await press.Escape(input);

    expect(
      q.dialog("Document root own capture dialog"),
    ).not.toBeInTheDocument();
  });
});

test("keeps global Escape outside a document-root dialog", async () => {
  await withDocumentRoot(async (q) => {
    const disclosure = q.button("Open document root outside dialog");
    await click(disclosure);
    expect(q.dialog("Document root outside dialog")).toBeVisible();

    await press.Escape(disclosure);

    expect(q.dialog("Document root outside dialog")).not.toBeInTheDocument();
  });
});

test("lets an outside capture handler own Escape in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root outside dialog"));
    const dialog = q.dialog("Document root outside dialog");
    const input = q.within(dialog).combobox.ensure("Search");
    const listbox = q.within(dialog).listbox("Suggestions");

    expect(dialog).toBeVisible();
    expect(input).toHaveFocus();
    expect(listbox).toBeVisible();

    await press.Escape(input);

    expect(listbox).toBeVisible();
    expect(dialog).toBeVisible();
  });
});
