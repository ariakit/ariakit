import {
  click,
  getByRole,
  press,
  queryByText,
  render,
  type,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getInput = (name: string) => getByRole("textbox", { name });
const getError = () => queryByText("Constraints not satisfied");

const spyOnAlert = () =>
  jest.spyOn(window, "alert").mockImplementation(() => {});

let alert = spyOnAlert();

beforeEach(() => {
  alert = spyOnAlert();
});

afterEach(() => {
  alert.mockClear();
});

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});
