import {
  click,
  getByRole,
  getByText,
  press,
  queryByRole,
  type,
} from "@ariakit/test";

const getInput = () => getByRole("combobox", { name: "Your favorite food" });
const getOption = (name: string) => getByRole("option", { name });
const queryOption = (name: string) => queryByRole("option", { name });

test("default checked", async () => {
  await click(getInput());
  expect(getOption("Bacon")).toHaveAttribute("aria-selected", "true");
});

test("check/uncheck with click", async () => {
  await click(getInput());
  await click(getOption("Burger"));
  await click(getOption("Banana"));
  expect(getOption("Burger")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
  await click(getOption("Burger"));
  expect(getOption("Burger")).toHaveAttribute("aria-selected", "false");
  await click(getOption("Banana"));
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
});

test("check/uncheck with enter", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
  await press.Enter();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
  await press.Enter();
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
});

test("check/uncheck item after filtering", async () => {
  await press.Tab();
  await type("b");
  expect(queryOption("Apple")).not.toBeInTheDocument();
  expect(getOption("Bacon")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  await press.Enter();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "false");
  expect(getOption("Bacon")).toHaveAttribute("aria-selected", "false");
  expect(getInput()).toHaveValue("");
  await type("ap");
  await press.ArrowUp();
  await press.Space();
  await press.Home();
  await press.Enter();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Pineapple")).toHaveAttribute("aria-selected", "true");
  expect(getInput()).toHaveValue("");
});

test("no result", async () => {
  await press.Tab();
  await type("zzz");
  expect(getByText("No results found")).toBeVisible();
});
