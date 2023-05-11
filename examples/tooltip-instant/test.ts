import { getByRole, hover, press, waitFor } from "@ariakit/test";

const getTooltip = () => getByRole("tooltip", { hidden: true });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(getTooltip()).not.toBeVisible();
  await hover(getByRole("button"));
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});

test("show tooltip on focus", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);
  expect(getTooltip()).not.toBeVisible();
  await press.Tab();
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await press.Tab();
  expect(getTooltip()).not.toBeVisible();
  div.remove();
});
