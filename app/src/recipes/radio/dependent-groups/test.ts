import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the status of each day and time in words", () => {
  const days = q.within(q.radiogroup("Day"));
  expect(days.radio("Tue 3 Nov 3 open")).toBeChecked();
  expect(days.radio("Thu 5 Nov Full")).toBeDisabled();
  const times = q.radiogroup("Time on Tuesday, 3 November");
  expect(times).toHaveAccessibleDescription("Times in São Paulo time (GMT−3)");
  expect(q.within(times).radio("10:30 Booked")).toBeDisabled();
});

test("books a time and clears it when the day changes", async () => {
  const days = q.within(q.radiogroup("Day"));
  const times = q.within(q.radiogroup("Time on Tuesday, 3 November"));
  expect(q.button("Book")).toBeDisabled();
  await click(times.text("14:00"));
  expect(times.radio("14:00")).toBeChecked();
  expect(q.button("Book Tue 3 Nov at 14:00")).toBeEnabled();
  await click(days.text("Wed 4 Nov"));
  const wednesday = q.within(q.radiogroup("Time on Wednesday, 4 November"));
  expect(wednesday.radio("11:00")).not.toBeChecked();
  expect(q.button("Book")).toBeDisabled();
});
