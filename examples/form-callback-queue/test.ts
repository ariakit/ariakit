import { click, press, q, type } from "@ariakit/test";

const validationError = () =>
  q.text(
    "Constraints not satisfied - Field 1 - Field 2 - Abstract Form - Form",
  );
const submitErrors = () =>
  q.text.all("Field - Abstract Form 1 - Abstract Form 2 - Form 1 - Form 2");

test("validation on sync input", async () => {
  await click(q.textbox.all().at(0)!);
  expect(validationError()).not.toBeInTheDocument();
  await click(document.body);
  expect(validationError()).toBeInTheDocument();
});

test("validation on async input", async () => {
  await click(q.textbox.all().at(1)!);
  expect(validationError()).not.toBeInTheDocument();
  await click(document.body);
  expect(validationError()).toBeInTheDocument();
});

test("submit", async () => {
  expect(submitErrors()).toHaveLength(0);
  await press.Tab();
  await type("a");
  await press.Tab();
  await type("a");
  await press.Tab();
  await press.Enter();
  expect(submitErrors()).toHaveLength(2);
});
