import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

function getRoles() {
  return q.listitem.all().map((item) => item.textContent);
}

test("shows the roles of the checked teams", async () => {
  const group = q.within(q.group("Filter by team"));
  expect(group.checkbox("Engineering")).toBeChecked();
  expect(q.status()).toHaveTextContent("2 open roles");
  expect(getRoles()).toEqual(["Frontend engineer", "Backend engineer"]);
  await click(group.text("Design"));
  expect(q.status()).toHaveTextContent("3 open roles");
  expect(getRoles()).toEqual([
    "Product designer",
    "Frontend engineer",
    "Backend engineer",
  ]);
});

test("shows all roles without a filter", async () => {
  const group = q.within(q.group("Filter by team"));
  await click(group.text("Support"));
  await click(group.text("Engineering"));
  // The count of one takes the singular.
  expect(q.status()).toHaveTextContent(/^1 open role$/);
  await click(group.text("Support"));
  expect(q.status()).toHaveTextContent("6 open roles");
  expect(getRoles()).toHaveLength(6);
});
