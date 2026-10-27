import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names the status of each day and time in words", async ({ q }) => {
    const days = query(q.radiogroup("Day"));
    await test.expect(days.radio("Tue 3 Nov 3 open")).toBeChecked();
    await test.expect(days.radio("Thu 5 Nov Full")).toBeDisabled();
    const times = q.radiogroup("Time on Tuesday, 3 November");
    await test
      .expect(times)
      .toHaveAccessibleDescription("Times in São Paulo time (GMT−3)");
    await test.expect(query(times).radio("10:30 Booked")).toBeDisabled();
  });

  test("books a time and clears it when the day changes", async ({ q }) => {
    const days = query(q.radiogroup("Day"));
    const times = query(q.radiogroup("Time on Tuesday, 3 November"));
    await test.expect(q.button("Book")).toBeDisabled();
    await times.text("14:00").click();
    await test.expect(times.radio("14:00")).toBeChecked();
    await test.expect(q.button("Book Tue 3 Nov at 14:00")).toBeEnabled();
    await days.text("Wed 4 Nov").click();
    const wednesday = query(q.radiogroup("Time on Wednesday, 4 November"));
    await test.expect(wednesday.radio("11:00")).not.toBeChecked();
    await test.expect(q.button("Book")).toBeDisabled();
  });
});
