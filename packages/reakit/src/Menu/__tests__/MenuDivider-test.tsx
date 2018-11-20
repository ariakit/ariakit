import * as React from "react";
import { render } from "react-testing-library";
import MenuDivier from "../MenuDivider";

test("html attrs", () => {
  const { getByTestId } = render(
    <MenuDivier id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<MenuDivier />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled horizontal", () => {
  const { container } = render(<MenuDivier horizontal />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled horizontalAt", () => {
  const { container } = render(<MenuDivier horizontalAt={500} />);
  expect(container.firstChild).toMatchSnapshot();
});
