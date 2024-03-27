import { getTextboxSelection } from "@ariakit/core/utils/dom";
import { press, q, type } from "@ariakit/test";

function getSelectionText(element: HTMLElement | HTMLInputElement | null) {
  if (!element) return null;
  const { start, end } = getTextboxSelection(element);
  const content =
    "value" in element ? element.value : element.textContent ?? "";
  const selectionValue = content.slice(start, end);
  return selectionValue;
}

function tags() {
  const combobox = q.combobox("Invitees");
  return q.option
    .all(undefined, {
      name(_, element) {
        return !!element.parentElement?.contains(combobox);
      },
    })
    .map((el) => el.textContent);
}

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
  expect(q.combobox()).toHaveValue("aidenfreeman91@email.com");
  expect(getSelectionText(q.combobox())).toBe("");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("data-active-item");
  expect(q.option(/Aiden Freeman /)).toHaveAttribute("aria-selected", "false");
});
