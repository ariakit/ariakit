import { getByRole, hover, press, waitFor } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  await waitFor(() =>
    expect(getByRole("tooltip", { hidden: true })).toBeVisible()
  );
  await hoverOutside();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  await waitFor(() =>
    expect(getByRole("tooltip", { hidden: true })).toBeVisible()
  );
  await press.Tab();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  div.remove();
});
