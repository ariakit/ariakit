import { dispatch, q, sleep, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6663
test("keeps focus in the combobox between IME composition sessions", async () => {
  const combobox = q.combobox.ensure("Fruit");

  combobox.focus();
  await type("사", combobox, { isComposing: true });
  expect(combobox).toHaveFocus();

  // A Korean IME commits the previous syllable and immediately starts
  // composing the next one within a single keystroke, so no animation frames
  // pass between compositionend and the next compositionstart.
  await dispatch.compositionEnd(combobox);
  await dispatch.compositionStart(combobox);
  await sleep();

  expect(q.option("사과")).not.toHaveFocus();
  expect(combobox).toHaveFocus();

  await type("고", combobox, { isComposing: true });
  await dispatch.compositionEnd(combobox);
  await sleep();

  expect(q.option("사과")).toHaveFocus();
});
