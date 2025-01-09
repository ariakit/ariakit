import { getTextboxSelection } from "@ariakit/core/utils/dom";
import { click, press, q, type } from "@ariakit/test";

function getSelectionText(element: HTMLElement | HTMLInputElement | null) {
  if (!element) return null;
  const { start, end } = getTextboxSelection(element);
  const content =
    "value" in element ? element.value : (element.textContent ?? "");
  const selectionValue = content.slice(start, end);
  return selectionValue;
}

function undo() {
  return press("z", null, { ctrlKey: true });
}

function redo() {
  return press("y", null, { ctrlKey: true });
}

function options() {
  return q.option.all().map((el) => el.textContent);
}

test("initial state", async () => {
  expect(q.listbox("Tags")).toBeVisible();
  expect(q.option.all()).toHaveLength(2);
  expect(q.option("JavaScript")).toBeVisible();
  expect(q.option("React")).toBeVisible();
  expect(q.textbox("Tags")).toBeVisible();
});

test("click on tag", async () => {
  await click(q.option("JavaScript"));
  expect(q.option("JavaScript")).toHaveFocus();
});

test("remove tag by clicking on remove button", async () => {
  const tag = q.option.ensure("JavaScript");
  await click(tag.querySelector("[aria-label^=Press]"));
  expect(q.textbox()).toHaveFocus();
  expect(q.option("JavaScript")).not.toBeInTheDocument();
});

test("remove tag by pressing Delete", async () => {
  await click(q.option("JavaScript"));
  await press.Delete();
  expect(q.option("React")).toHaveFocus();
  expect(q.option("JavaScript")).not.toBeInTheDocument();
});

test("remove tag by pressing Backspace on the tag", async () => {
  await click(q.option("React"));
  await press.Backspace();
  expect(q.option("JavaScript")).toHaveFocus();
  expect(q.option("React")).not.toBeInTheDocument();
});

test("remove tag by pressing Backspace on the textbox", async () => {
  await click(q.textbox("Tags"));
  expect(q.option.all()).toHaveLength(2);
  await press.Backspace();
  expect(q.textbox()).toHaveFocus();
  expect(q.option("React")).not.toBeInTheDocument();
  expect(q.option("JavaScript")).toBeInTheDocument();
});

test("add tags by typing", async () => {
  await press.Tab();
  await type("abc ");
  expect(q.textbox("Tags")).toHaveFocus();
  expect(q.textbox("Tags")).toHaveValue("");
  expect(q.option.all()).toHaveLength(3);
  await type("def, ghi;");
  expect(q.option.all()).toHaveLength(5);
  expect(q.option("abc")).toBeVisible();
  expect(q.option("def")).toBeVisible();
  expect(q.option("ghi")).toBeVisible();
  expect(q.textbox("Tags")).toHaveFocus();
  expect(q.textbox("Tags")).toHaveValue("");
  // Move focus between tag list elements
  await press.ArrowLeft();
  expect(q.option("ghi")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.option("def")).toHaveFocus();
  await press.Home();
  expect(q.option("JavaScript")).toHaveFocus();
  await press.End();
  expect(q.textbox("Tags")).toHaveFocus();
});

test("add tags after typing delimiters", async () => {
  await press.Tab();
  await type(", ghi");
  await press.ArrowLeft();
  await press.ArrowLeft();
  await press.ArrowLeft();
  await press.ArrowLeft();
  await press.ArrowLeft();
  await type("abc def");
  await press.ArrowRight();
  await press.ArrowRight();
  await press.ArrowRight();
  await press.ArrowRight();
  await press.ArrowRight();
  await type(",");
  expect(options()).toEqual(["JavaScript", "React", "abc def", "ghi"]);
});

test("move focus between tag list elements", async () => {
  await press.Tab();
  expect(q.textbox("Tags")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.option("React")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.option("JavaScript")).toHaveFocus();
  // Type while focused an a tag
  await type("TypeScript");
  expect(q.textbox("Tags")).toHaveFocus();
  expect(q.textbox("Tags")).toHaveValue("TypeScript");
  // Move focus to the first tag
  await press.Home();
  expect(q.option("JavaScript")).toHaveFocus();
  await press.End();
  expect(q.textbox("Tags")).toHaveFocus();
  expect(q.textbox("Tags")).toHaveValue("TypeScript");
  expect(getSelectionText(q.textbox("Tags"))).toBe("TypeScript");
  await press.ArrowLeft();
  expect(q.option("React")).toHaveFocus();
  await press.ArrowUp();
  expect(q.option("JavaScript")).toHaveFocus();
  // Do not loop
  await press.ArrowLeft();
  expect(q.option("JavaScript")).toHaveFocus();
});

test("undo/redo removing tags", async () => {
  const tag = q.option.ensure("React");
  await click(tag.querySelector("[aria-label^=Press]"));
  expect(options()).toEqual(["JavaScript"]);
  expect(q.textbox("Tags")).toHaveFocus();
  await undo();
  expect(options()).toEqual(["JavaScript", "React"]);
  expect(q.textbox("Tags")).toHaveFocus();
  await press.Home();
  await press.Delete();
  expect(options()).toEqual(["React"]);
  await undo();
  expect(options()).toEqual(["JavaScript", "React"]);
  expect(q.textbox("Tags")).toHaveFocus();
  await redo();
  expect(options()).toEqual(["React"]);
  expect(q.textbox("Tags")).toHaveFocus();
});

test("undo/redo typing", async () => {
  await press.Tab();
  await type("abc def ghi ");
  expect(options()).toEqual(["JavaScript", "React", "abc", "def", "ghi"]);
  await press.Backspace();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  await press.Backspace();
  expect(options()).toEqual(["JavaScript", "React", "abc"]);
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def", "ghi"]);
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  expect(q.textbox("Tags")).toHaveFocus();
  expect(q.textbox("Tags")).toHaveValue("ghi");
  await type("jkl ");
  expect(options()).toEqual(["JavaScript", "React", "abc", "def", "ghijkl"]);
  // Redo does nothing since we changed the state after undo
  await redo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def", "ghijkl"]);
  expect(q.textbox()).toHaveValue("");
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  expect(q.textbox()).toHaveValue("ghijkl");
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  expect(q.textbox()).toHaveValue("ghi");
  await undo();
  expect(options()).toEqual(["JavaScript", "React", "abc"]);
  expect(q.textbox()).toHaveValue("def");
  await redo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  expect(q.textbox()).toHaveValue("ghi ");
  await redo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def"]);
  expect(q.textbox()).toHaveValue("ghijkl ");
  await redo();
  expect(options()).toEqual(["JavaScript", "React", "abc", "def", "ghijkl"]);
  expect(q.textbox()).toHaveValue("");
});
