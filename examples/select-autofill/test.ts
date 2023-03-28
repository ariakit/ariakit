import {
  fireEvent,
  focus,
  getAllByLabelText,
  getByRole,
  waitFor,
} from "@ariakit/test";

const getNativeSelect = () => getAllByLabelText("Role")[0]!;
const getSelect = () => getByRole("combobox", { name: "Role" });

test("select has data-autofill attribute", () => {
  expect(getSelect()).not.toHaveAttribute("data-autofill");
  fireEvent.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(getSelect()).toHaveAttribute("data-autofill");
});

test("focusing on native select moves focus to custom select", async () => {
  expect(getSelect()).not.toHaveFocus();
  focus(getNativeSelect());
  await waitFor(() => expect(getSelect()).toHaveFocus());
});
