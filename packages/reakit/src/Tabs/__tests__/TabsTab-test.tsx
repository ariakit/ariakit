import * as React from "react";
import { fireEvent, render } from "react-testing-library";
import TabsTab, { TabsTabProps } from "../TabsTab";

const props: TabsTabProps = {
  tab: "foo",
  current: 1,
  register: jest.fn(),
  update: jest.fn(),
  unregister: jest.fn(),
  show: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  isCurrent: jest.fn().mockReturnValue(false)
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("html attrs", () => {
  const { getByText } = render(
    <TabsTab id="test" aria-label="test" data-testid="test" {...props}>
      Test
    </TabsTab>
  );
  expect(getByText("Test")).toHaveAttribute("id", "test");
  expect(getByText("Test")).toHaveAttribute("aria-label", "test");
});

test("call show when clicked", async () => {
  const { getByText } = render(<TabsTab {...props}>Test</TabsTab>);
  fireEvent.click(getByText("Test"));
  expect(props.show).toHaveBeenCalledWith("foo");
});

test("do not call show when isCurrent and clicked", async () => {
  const { getByText } = render(
    <TabsTab {...props} isCurrent={() => true}>
      Test
    </TabsTab>
  );
  fireEvent.click(getByText("Test"));
  expect(props.show).not.toHaveBeenCalled();
});

test("visible when it is current", () => {
  const { getByText } = render(
    <TabsTab {...props} isCurrent={() => true}>
      Test
    </TabsTab>
  );
  expect(getByText("Test")).toHaveAttribute("aria-hidden", "false");
});

test("styled", () => {
  const { container } = render(<TabsTab {...props} />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: unset;
  color: inherit;
}

.c0 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c0[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

<li
  aria-controls="fooPanel"
  aria-hidden="false"
  aria-selected="true"
  class="active c0 c1"
  id="fooTab"
  role="tab"
  step="foo"
  tabindex="0"
/>
`);
});

test("styled selected", () => {
  const { container } = render(
    <TabsTab {...props} isCurrent={jest.fn().mockReturnValue(true)} />
  );
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: unset;
  color: inherit;
}

.c0 {
  -webkit-transform: translate3d(0px,0px,0px);
  -ms-transform: translate3d(0px,0px,0px);
  transform: translate3d(0px,0px,0px);
}

.c0[aria-hidden="true"] {
  pointer-events: none;
  display: none !important;
}

<li
  aria-controls="fooPanel"
  aria-hidden="false"
  aria-selected="true"
  class="active c0 c1"
  id="fooTab"
  role="tab"
  step="foo"
  tabindex="0"
/>
`);
});
