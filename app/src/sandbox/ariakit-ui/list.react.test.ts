import { q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { ListExamples } from "./pages/list.react.tsx";

mountExamples(ListExamples);

function getRow(title: string, text: string) {
  const rows = q.within(q.article(title)).listitem.all();
  const row = rows.find((item) => item.textContent === text);
  if (!row) {
    throw new Error(`No "${text}" row in the ${title} example`);
  }
  return q.within(row);
}

test("describes the value of a progress marker", () => {
  const inProgress = getRow("Checklist", "Collect the replies");
  expect(inProgress.img("Unchecked")).toHaveAccessibleDescription(
    "65% complete",
  );
  const done = getRow("Checklist", "Book the venue");
  expect(done.img("Checked")).not.toHaveAttribute("aria-description");
});
