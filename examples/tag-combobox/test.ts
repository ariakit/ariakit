import { getTextboxSelection } from "@ariakit/utils";
import { expect, test, press, q, type } from "../../browser-test-utils.ts";

type MaybeLocatorElement =
  | HTMLElement
  | HTMLInputElement
  | { query: () => Element | null }
  | null;

function getSelectionText(target: MaybeLocatorElement) {
  const element = target && "query" in target ? target.query() : target;
  if (!(element instanceof HTMLElement)) return null;
  if (!element) return null;
  const { start, end } = getTextboxSelection(element);
  const content =
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
      ? element.value
      : (element.textContent ?? "");
  const selectionValue = content.slice(start, end);
  return selectionValue;
}

function tags() {
  const combobox = q.combobox("Invitees").query();
  return q.option
    .all()
    .filter((element) => element.parentElement?.contains(combobox))
    .map((el) => el.textContent);
}

test("initial state", async () => {
  expect(tags()).toEqual(["Abigail Patterson"]);
});

test("reset the value on selecting a tag from the combobox suggestions", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await type("bella");
  expect(q.combobox()).toHaveValue("bellawebb86@email.com");
  await press.Enter();
  expect(tags()).toEqual(["Abigail Patterson", "Bella Webb"]);
  expect(q.combobox()).toHaveValue("");
});

test("the value should not reset when removing a tag from the tag list", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await type("a");
  expect(q.combobox()).toHaveValue("a");
  await press.ArrowLeft();
  await press.Backspace();
  expect(tags()).toEqual([]);
  expect(q.combobox()).toHaveValue("a");
});

test("suggestions reset after selecting a tag", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await type("dan");
  await press.Enter();
  expect(tags()).toEqual(["Abigail Patterson", "Daniel Green"]);
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option(/Abigail Patterson /)).toHaveAttribute("data-active-item");
  expect(q.option(/Abigail Patterson /)).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("deselecting a tag should not highlight the input text if it is not the first combobox item", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await type("aid");
  expect(q.combobox()).toHaveValue("aidenfreeman91@email.com");
  expect(getSelectionText(q.combobox())).toBe("enfreeman91@email.com");
  await press.Enter();
  expect(tags()).toEqual(["Abigail Patterson", "Aiden Freeman"]);
  await type("aid");
  expect(q.combobox()).toHaveValue("aid");
  expect(getSelectionText(q.combobox())).toBe("");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("data-active-item");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("aria-selected", "true");
  await press.Enter();
  expect(tags()).toEqual(["Abigail Patterson"]);
  expect(q.combobox()).toHaveValue("");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("data-active-item");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("aria-selected", "false");
  await press.ArrowUp();
  expect(q.combobox()).toHaveValue("abigailrivera35@email.com");
  expect(q.option(/Abigail Rivera /)).toHaveAttribute("data-active-item");
  expect(q.option(/Abigail Rivera /)).toHaveAttribute("aria-selected", "false");
  await press.ArrowDown();
  expect(q.combobox()).toHaveValue("aidenfreeman91@email.com");
  expect(getSelectionText(q.combobox())).toBe("");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("data-active-item");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("aria-selected", "false");
});
