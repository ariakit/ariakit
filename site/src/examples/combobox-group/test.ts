import { click, dispatch, hover, press, q, type } from "@ariakit/test";

function getSelectionValue(element: Element | HTMLInputElement | null) {
  if (!element || !("value" in element)) {
    throw new Error();
  }
  const { selectionStart, selectionEnd } = element;
  const selectionValue = element.value.slice(selectionStart!, selectionEnd!);
  return selectionValue;
}

test("auto select with inline autocomplete on typing", async () => {
  await press.Tab();
  await type("a");
  expect(q.combobox()).toHaveValue("annual_report.pdf");
  expect(getSelectionValue(q.combobox())).toBe("nnual_report.pdf");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("images_backup.tar.gz");
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowUp();
  expect(q.combobox()).toHaveValue("annual_report.pdf");
  expect(getSelectionValue(q.combobox())).toBe("nnual_report.pdf");
  await type("e");
  expect(q.combobox()).toHaveValue("ae");
  expect(getSelectionValue(q.combobox())).toBe("");
  await type("\b\bj");
  expect(q.combobox()).toHaveValue("john Smith");
  expect(getSelectionValue(q.combobox())).toBe("ohn Smith");
  await type("\bo");
  expect(q.combobox()).toHaveValue("john Smith");
  expect(getSelectionValue(q.combobox())).toBe("hn Smith");
});

test("auto select with inline autocomplete on arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("John Smith");
  expect(getSelectionValue(q.combobox())).toBe("John Smith");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Emma Johnson");
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowUp();
  expect(q.combobox()).toHaveValue("John Smith");
});

test("auto select with inline autocomplete on typing + clearing", async () => {
  await press.Tab();
  await type("em");
  expect(q.combobox()).toHaveValue("emma Johnson");
  expect(getSelectionValue(q.combobox())).toBe("ma Johnson");
  await type("\b");
  expect(q.combobox()).toHaveValue("em");
  expect(q.option("Emma Johnson")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");
  await type("\b");
  expect(q.combobox()).toHaveValue("e");
  await type("\b");
  expect(q.combobox()).toHaveValue("");
  await type("j");
  expect(q.combobox()).toHaveValue("john Smith");
  expect(q.option("John Smith")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("ohn Smith");
  await type("\b");
  expect(q.combobox()).toHaveValue("j");
});

test("text selection with shift+arrow keys and replacement", async () => {
  await press.Tab();
  // Navigate to an item using arrow keys (no auto-completion highlighting)
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Emma Johnson");
  expect(q.option("Emma Johnson")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");

  // Test ArrowLeft + shiftKey for text selection
  for (const _ of "Emma Johnson") {
    await press.ArrowLeft(null, { shiftKey: true });
  }
  expect(getSelectionValue(q.combobox())).toBe("Emma Johnson");

  // Type after selection to replace selected text
  await type("m");
  expect(q.combobox()).toHaveValue("michael Brown");
  expect(q.option("Michael Brown")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("ichael Brown");
});

test("blur input after autocomplete", async () => {
  await press.Tab();
  await type("a");
  expect(q.combobox()).toHaveValue("annual_report.pdf");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("images_backup.tar.gz");
  await click(document.body);
  await click(document.body);
  expect(q.combobox()).toHaveValue("images_backup.tar.gz");
});

test("autocomplete on focus on hover", async () => {
  await click(q.combobox());
  await type("m");
  expect(q.combobox()).toHaveValue("michael Brown");
  await hover(q.option("Sarah Davis"));
  expect(q.combobox()).toHaveValue("m");
});

test("composition text", async () => {
  // TODO: Add composition util to @ariakit/test
  await dispatch.compositionStart(q.combobox());
  await type("'", q.combobox(), { isComposing: true });
  expect(q.option("John Smith")).not.toBeInTheDocument();
  await type("á", q.combobox(), { isComposing: true });
  await dispatch.compositionEnd(q.combobox());
  expect(q.combobox()).toHaveValue("ánnual_report.pdf");
  expect(getSelectionValue(q.combobox())).toBe("nnual_report.pdf");
  expect(q.option("annual_report.pdf")).toHaveFocus();
});
