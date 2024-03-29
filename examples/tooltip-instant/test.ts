import { hover, press, q } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(q.tooltip("Tooltip")).not.toBeInTheDocument();
  await hover(q.button());
  expect(q.tooltip("Tooltip")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip("Tooltip")).not.toBeInTheDocument();
});

test("show tooltip on focus", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);
  expect(q.tooltip("Tooltip")).not.toBeInTheDocument();
  await press.Tab();
  expect(q.tooltip("Tooltip")).toBeVisible();
  await press.Tab();
  expect(q.tooltip("Tooltip")).not.toBeInTheDocument();
  div.remove();
});
