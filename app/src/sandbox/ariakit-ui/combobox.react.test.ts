import { q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { ComboboxExamples } from "./pages/combobox.react.tsx";

mountExamples(ComboboxExamples);

test("joins the values of a multiple selection", () => {
  const box = q.within(q.article("Multiple selection"));
  expect(box.combobox("Toppings")).toHaveTextContent("Cheese, Olives");
});
