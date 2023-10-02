import { press, q } from "@ariakit/test";

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
  expect(q.text("Before")).toHaveFocus();
  await press.Tab();
  expect(q.checkbox()).toHaveFocus();
  await press.Space(q.checkbox());
  await press.Tab();
  expect(q.button("Button 1")).toHaveFocus();
  await press.Tab();
  expect(q.button("Button 2")).toHaveFocus();
  await press.Tab();
  expect(q.textbox("one")).toHaveFocus();
  await press.Tab();
  // looped
  expect(q.checkbox()).toHaveFocus();
  cleanup();
});

test("correctly releases focus from region", async () => {
  const cleanup = setup();
  await press.Tab();
  expect(q.text("Before")).toHaveFocus();
  await press.Tab();
  expect(q.checkbox()).toHaveFocus();
  await press.Space(q.checkbox());
  await press.Tab();
  expect(q.button("Button 1")).toHaveFocus();
  await press.Tab();
  expect(q.button("Button 2")).toHaveFocus();
  await press.Tab();
  expect(q.textbox("one")).toHaveFocus();
  await press.Tab();
  await press.Space(q.checkbox());
  await press.Tab();
  await press.Tab();
  await press.Tab();
  await press.Tab();
  expect(q.text("After")).toHaveFocus();
  cleanup();
});
