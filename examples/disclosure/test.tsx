import { click, getByRole, getByText, press, render } from "@ariakit/test";
import Example from ".";

const getContent = () => getByText(/Vegetables are parts of plants/);
const getDisclosure = () =>
  getByRole("button", { name: "What are vegetables?" });

test("show/hide on click", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "false");
  await click(getDisclosure());
  expect(getContent()).toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "true");
  await click(getDisclosure());
  expect(getContent()).not.toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(getContent()).toBeVisible();
  await press.Enter();
  expect(getContent()).not.toBeVisible();
});

test("show/hide on space", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  await press.Tab();
  await press.Space();
  expect(getContent()).toBeVisible();
  await press.Space();
  expect(getContent()).not.toBeVisible();
});
