import {
  click,
  getAllByRole,
  press,
  queryAllByText,
  queryByText,
  type,
} from "@ariakit/test";

const getInput = (index: number) => getAllByRole("textbox").at(index)!;
const getValidationError = () =>
  queryByText(
    "Constraints not satisfied - Field 1 - Field 2 - Abstract Form - Form",
  );
const getSubmitErrors = () =>
  queryAllByText("Field - Abstract Form 1 - Abstract Form 2 - Form 1 - Form 2");

test("validation on sync input", async () => {
  await click(getInput(0));
  expect(getValidationError()).not.toBeInTheDocument();
  await click(document.body);
  expect(getValidationError()).toBeInTheDocument();
});

test("validation on async input", async () => {
  await click(getInput(1));
  expect(getValidationError()).not.toBeInTheDocument();
  await click(document.body);
  expect(getValidationError()).toBeInTheDocument();
});

test("submit", async () => {
  expect(getSubmitErrors()).toHaveLength(0);
  await press.Tab();
  await type("a");
  await press.Tab();
  await type("a");
  await press.Tab();
  await press.Enter();
  expect(getSubmitErrors()).toHaveLength(2);
});
