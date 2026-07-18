import { click, focus, press, q } from "@ariakit/test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { DocumentRootDocument } from "./index.react.tsx";

async function withDocumentRoot(
  callback: (query: ReturnType<typeof q.within>) => Promise<void>,
  stopPropagation?: "bubble" | "capture",
) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  const frameDocument = iframe.contentDocument;
  if (!frameDocument) throw new Error("iframe document is not available");
  const capture = stopPropagation === "capture";
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
  };
  if (stopPropagation) {
    frameDocument.addEventListener("keydown", onKeyDown, capture);
  }
  const root = createRoot(frameDocument);
  try {
    await act(async () => {
      root.render(createElement(DocumentRootDocument));
    });
    await callback(q.within(frameDocument.body));
  } finally {
    await act(async () => root.unmount());
    frameDocument.removeEventListener("keydown", onKeyDown, capture);
    iframe.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
}

test.each(["capture", "bubble"] as const)(
  "does not reclaim Escape stopped before React's document %s listener",
  async (phase) => {
    await withDocumentRoot(async (q) => {
      const name = `Document root own ${phase} dialog`;
      await click(q.button(`Open ${name.toLowerCase()}`));
      const input = q.combobox.ensure("Search");
      expect(q.dialog(name)).toBeVisible();

      if (phase === "bubble") {
        await press.Escape(input);
        expect(q.listbox("Suggestions")).not.toBeInTheDocument();
      }

      await press.Escape(input);

      expect(q.dialog(name)).toBeVisible();
    }, phase);
  },
);

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

test.each(["Ariakit Portal", "React portal"])(
  "lets a %s child handle Escape before the dialog",
  async (portal) => {
    const dialogName = `${portal} child dialog`;
    await click(q.button(`Open ${dialogName.toLowerCase()}`));
    const input = q.combobox.ensure("Search");
    expect(q.dialog(dialogName)).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await focus(input);
    expect(input).toHaveFocus();
    expect(q.dialog(dialogName)).toBeVisible();

    await press.Escape(input);

    expect(q.listbox("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog(dialogName)).toBeVisible();

    await press.Escape(input);

    expect(q.dialog(dialogName)).not.toBeInTheDocument();
  },
);

test("lets an ancestor capture handler own Escape", async () => {
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

test("closes on an unclaimed Escape outside the dialog", async () => {
  const disclosure = q.button("Open outside dialog");
  await click(disclosure);
  expect(q.dialog("Outside dialog")).toBeVisible();

  await focus(disclosure);
  await press.Escape(disclosure);

  expect(q.dialog("Outside dialog")).not.toBeInTheDocument();
});

test("lets an ancestor capture handler own Escape outside the dialog", async () => {
  const disclosure = q.button("Open outer capture dialog");
  await click(disclosure);
  expect(q.dialog("Outer capture dialog")).toBeVisible();

  await focus(disclosure);
  await press.Escape(disclosure);

  expect(q.dialog("Outer capture dialog")).toBeVisible();
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

test("stops Escape before a third-party dialog bubble handler", async () => {
  await click(q.button("Open third-party dialog"));
  await click(q.button("Open nested ariakit dialog"));
  expect(q.dialog("Third-party dialog")).toBeVisible();
  expect(q.dialog("Nested Ariakit dialog")).toBeVisible();

  await press.Escape(q.button("Inside nested ariakit dialog"));

  expect(q.dialog("Nested Ariakit dialog")).not.toBeInTheDocument();
  expect(q.dialog("Third-party dialog")).toBeVisible();
});

test("can stop Escape before a third-party dialog capture handler", async () => {
  await click(q.button("Open capture third-party dialog"));
  await click(q.button("Open shielded ariakit dialog"));
  expect(q.dialog("Capture third-party dialog")).toBeVisible();
  expect(q.dialog("Shielded Ariakit dialog")).toBeVisible();

  await press.Escape(q.button("Inside shielded ariakit dialog"));

  expect(q.dialog("Shielded Ariakit dialog")).not.toBeInTheDocument();
  expect(q.dialog("Capture third-party dialog")).toBeVisible();
});

test("calls a rejected hideOnEscape callback once", async () => {
  await click(q.button("Open rejected callback dialog"));
  const dialog = q.dialog("Rejected callback dialog");
  const button = q.within(dialog).button.ensure("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).toBeVisible();
  expect(q.within(dialog).button("Callback calls: 1")).toBeVisible();
});

test("calls an accepted hideOnEscape callback once", async () => {
  const disclosure = q.button("Open accepted callback dialog");
  await click(disclosure);
  const dialog = q.dialog("Accepted callback dialog");
  const button = q.within(dialog).button.ensure("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).not.toBeVisible();
  await click(disclosure);
  expect(q.within(dialog).button("Callback calls: 1")).toBeVisible();
});

test("accepts default prevention from hideOnEscape", async () => {
  await click(q.button("Open prevented callback dialog"));
  const dialog = q.dialog("Prevented callback dialog");
  const button = q.within(dialog).button.ensure("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).not.toBeVisible();
});

test("hides when hideOnEscape stops Escape from a React portal", async () => {
  await click(q.button("Open react portal callback dialog"));
  const dialog = q.dialog("React portal callback dialog");
  const button = q.button.ensure("Callback calls: 0");
  expect(dialog).toBeVisible();

  await focus(button);
  await press.Escape(button);

  expect(dialog).not.toBeVisible();
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

test("lets a child handle Escape in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root dialog"));
    const input = q.combobox.ensure("Search");
    expect(q.dialog("Document root dialog")).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await press.Escape(input);

    expect(q.listbox("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog("Document root dialog")).toBeVisible();

    await press.Escape(input);

    expect(q.dialog("Document root dialog")).not.toBeInTheDocument();
  });
});

test("respects default prevention in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root prevented dialog"));
    const input = q.combobox.ensure("Search");
    expect(q.dialog("Document root prevented dialog")).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await press.Escape(input);

    expect(q.listbox("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog("Document root prevented dialog")).toBeVisible();

    await press.Escape(input);

    expect(q.dialog("Document root prevented dialog")).not.toBeInTheDocument();
  });
});

test("hides after its own bubble handler in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root own bubble dialog"));
    const input = q.combobox.ensure("Search");
    expect(q.dialog("Document root own bubble dialog")).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await press.Escape(input);

    expect(q.listbox("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog("Document root own bubble dialog")).toBeVisible();

    await press.Escape(input);

    expect(q.dialog("Document root own bubble dialog")).not.toBeInTheDocument();
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

test("hides when hideOnEscape stops Escape in a document root", async () => {
  await withDocumentRoot(async (q) => {
    await click(q.button("Open document root callback dialog"));
    const dialog = q.dialog("Document root callback dialog");
    const button = q.within(dialog).button.ensure("Callback calls: 0");
    expect(dialog).toBeVisible();

    await press.Escape(button);

    expect(dialog).not.toBeVisible();
  });
});

test("closes on global Escape outside a document-root dialog", async () => {
  await withDocumentRoot(async (q) => {
    const disclosure = q.button("Open document root global dialog");
    await click(disclosure);
    expect(q.dialog("Document root global dialog")).toBeVisible();

    await press.Escape(disclosure);

    expect(q.dialog("Document root global dialog")).not.toBeInTheDocument();
  });
});

test("lets an ancestor capture handler own global Escape", async () => {
  await withDocumentRoot(async (q) => {
    const disclosure = q.button("Open document root outside dialog");
    await click(disclosure);
    expect(q.dialog("Document root outside dialog")).toBeVisible();

    await press.Escape(disclosure);

    expect(q.dialog("Document root outside dialog")).toBeVisible();
  });
});

test("lets an ancestor capture handler own Escape in a document root", async () => {
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
