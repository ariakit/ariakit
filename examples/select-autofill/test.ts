import {
  expect,
  test,
  dispatch,
  focus,
  q,
  waitFor,
} from "../../browser-test-utils.ts";

function getNativeSelect() {
  const select = document.querySelector<HTMLSelectElement>(
    'select[name="role"]',
  );
  if (!select) throw new Error("Unable to find native select");
  return select;
}

test("select has data-autofill attribute", async () => {
  expect(q.combobox()).not.toHaveAttribute("data-autofill");
  await dispatch.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(q.combobox()).toHaveAttribute("data-autofill");
});

test("focusing on native select moves focus to custom select", async () => {
  expect(q.combobox()).not.toHaveFocus();
  await focus(getNativeSelect());
  await waitFor(() => expect(q.combobox()).toHaveFocus());
});
