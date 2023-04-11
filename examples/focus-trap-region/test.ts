import { getByRole, getByText, press } from "@ariakit/test";

function setup() {
  const before = document.createElement("div");
  before.tabIndex = 0;
  before.textContent = "Before";
  const after = before.cloneNode() as HTMLDivElement;
  after.textContent = "After";
  document.body.prepend(before);
  document.body.append(after);
  return () => {
    before.remove();
    after.remove();
  };
}

test("correctly traps focus in region", async () => {
  const cleanup = setup();
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  expect(getByRole("button", { name: "Button 1" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("button", { name: "Button 2" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("textbox", { name: "one" })).toHaveFocus();
  await press.Tab();
  // looped
  expect(getByRole("checkbox")).toHaveFocus();
  cleanup();
});

test("correctly releases focus from region", async () => {
  const cleanup = setup();
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  expect(getByRole("button", { name: "Button 1" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("button", { name: "Button 2" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("textbox", { name: "one" })).toHaveFocus();
  await press.Tab();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  await press.Tab();
  await press.Tab();
  await press.Tab();
  expect(getByText("After")).toHaveFocus();
  cleanup();
});
