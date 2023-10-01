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
  expect(q.combobox()).toHaveValue("apple");
  expect(getSelectionValue(q.combobox())).toBe("pple");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Avocado");
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowUp();
  expect(q.combobox()).toHaveValue("apple");
  expect(getSelectionValue(q.combobox())).toBe("pple");
  await type("e");
  expect(q.combobox()).toHaveValue("ae");
  expect(getSelectionValue(q.combobox())).toBe("");
  await type("\b\bv");
  expect(q.combobox()).toHaveValue("vodka");
  expect(getSelectionValue(q.combobox())).toBe("odka");
  await type("\bo");
  expect(q.combobox()).toHaveValue("vodka");
  expect(getSelectionValue(q.combobox())).toBe("dka");
});

test("auto select with inline autocomplete on arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Apple");
  expect(getSelectionValue(q.combobox())).toBe("Apple");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Avocado");
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowUp();
  expect(q.combobox()).toHaveValue("Apple");
});

test("auto select with inline autocomplete on typing + arrow down", async () => {
  await press.Tab();
  await type("av");
  expect(q.combobox()).toHaveValue("avocado");
  expect(getSelectionValue(q.combobox())).toBe("ocado");
  await type("\b");
  expect(q.combobox()).toHaveValue("av");
  expect(q.option("Avocado")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");
  await type("\b");
  expect(q.combobox()).toHaveValue("a");
  expect(q.option("Apple")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Avocado");
  expect(q.option("Avocado")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");
  for (const _ of "Avocado") {
    await press.ArrowLeft(null, { shiftKey: true });
  }
  await type("p");
  expect(q.combobox()).toHaveValue("papaya");
  expect(q.option("Papaya")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("apaya");
  await type("\b");
  await press.ArrowLeft();
  await type("a");
  expect(q.combobox()).toHaveValue("ap");
  expect(q.option("Apple")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("");
  await press.ArrowRight();
  await type("p");
  expect(q.combobox()).toHaveValue("apple");
  expect(q.option("Apple")).toHaveFocus();
  expect(getSelectionValue(q.combobox())).toBe("le");
});

test("blur input after autocomplete", async () => {
  await press.Tab();
  await type("a");
  expect(q.combobox()).toHaveValue("apple");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("Avocado");
  await click(document.body);
  await click(document.body);
  expect(q.combobox()).toHaveValue("Avocado");
});

test("autocomplete on focus on hover", async () => {
  await click(q.combobox());
  await type("g");
  expect(q.combobox()).toHaveValue("gelato");
  await hover(q.option("Pudding"));
  expect(q.combobox()).toHaveValue("g");
});

test("composition text", async () => {
  // TODO: Add composition util to @ariakit/test
  await dispatch.compositionStart(q.combobox());
  await type("'", q.combobox(), { isComposing: true });
  expect(q.option("Apple")).not.toBeInTheDocument();
  await type("á", q.combobox(), { isComposing: true });
  await dispatch.compositionEnd(q.combobox());
  expect(q.combobox()).toHaveValue("ápple");
  expect(getSelectionValue(q.combobox())).toBe("pple");
  expect(q.option("Apple")).toHaveFocus();
});
