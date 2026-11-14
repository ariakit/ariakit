import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("hides an avatar without a label from assistive technology", () => {
  const avatar = q.within(q.article("Default")).text("HK");
  expect(avatar).toHaveAttribute("aria-hidden", "true");
  expect(avatar).not.toHaveAttribute("role");
});

test("exposes a labelled avatar as one image", () => {
  const avatar = q.within(q.article("Labelled avatar")).img("Hana Kobayashi");
  expect(avatar).toHaveTextContent("HK");
  expect(avatar).not.toHaveAttribute("aria-hidden");
});

test("keeps the link role of an avatar that renders a link", () => {
  const link = q.within(q.article("Link avatar")).link("Hana Kobayashi");
  expect(link).toHaveAttribute("href", "#hana");
  expect(link).not.toHaveAttribute("aria-hidden");
});

test("gives a labelled group the group role", () => {
  const group = q.within(q.article("Group")).group("Project members");
  expect(q.within(group).img.all()).toHaveLength(5);
  expect(q.within(group).img("3 more members")).toHaveTextContent("+3");
});
