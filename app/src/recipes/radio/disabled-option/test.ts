import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("tells why a card is disabled and skips it with the arrow keys", async () => {
  const group = q.within(q.radiogroup("Shipping method"));
  const sameDay = group.radio("Same day $25");
  expect(sameDay).toBeDisabled();
  expect(sameDay).toHaveAccessibleDescription("Not available for 94107");
  await click(group.text("Standard"));
  expect(group.radio("Standard Free")).toHaveFocus();
  await press.ArrowDown();
  expect(group.radio("Express $12")).toBeChecked();
  await press.ArrowDown();
  expect(group.radio("Standard Free")).toBeChecked();
  expect(group.radio("Standard Free")).toHaveFocus();
});

test("keeps the Arabic version in its own group", async () => {
  const english = q.within(q.radiogroup("Shipping method"));
  const arabic = q.within(q.radiogroup("طريقة الشحن"));
  expect(arabic.radio("عادي مجاني")).toBeChecked();
  expect(arabic.radio("في اليوم نفسه 25 $")).toHaveAccessibleDescription(
    "غير متاح للرمز البريدي 94107",
  );
  await click(arabic.text("سريع"));
  expect(arabic.radio("سريع 12 $")).toBeChecked();
  expect(english.radio("Standard Free")).toBeChecked();
});
