import * as React from "react";
import { render } from "react-testing-library";
import TabsPanel, { TabsPanelProps } from "../TabsPanel";

const props: TabsPanelProps = {
  tab: "foo",
  isCurrent: jest.fn().mockReturnValue(true)
};

test("html attrs", () => {
  const { getByText } = render(
    <TabsPanel id="test" aria-label="test" data-testid="test" {...props}>
      Test
    </TabsPanel>
  );
  expect(getByText("Test")).toHaveAttribute("id", "test");
  expect(getByText("Test")).toHaveAttribute("aria-label", "test");
});

test("isCurrent", () => {
  const { container, rerender } = render(
    <TabsPanel {...props} isCurrent={jest.fn().mockReturnValue(false)}>
      Test
    </TabsPanel>
  );
  expect(container.firstChild).toBeNull();
  rerender(<TabsPanel {...props} />);
  expect(container.firstChild).not.toBeNull();
});

test("tab", () => {
  const currentTab = "second";
  const isCurrent = (idOrIndex: string | number): boolean =>
    idOrIndex === currentTab;
  const { container, rerender } = render(
    <TabsPanel tab={currentTab} isCurrent={isCurrent}>
      Test
    </TabsPanel>
  );
  expect(container.firstChild).not.toBeNull();
  rerender(<TabsPanel tab="first" isCurrent={isCurrent} />);
  expect(container.firstChild).toBeNull();
});

test("unmounted when it is not current", () => {
  const { container } = render(
    <TabsPanel {...props} isCurrent={() => false}>
      Test
    </TabsPanel>
  );
  expect(container.firstChild).toBeNull();
});

test("styled isCurrent", () => {
  const { container } = render(<TabsPanel {...props} />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
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

<div
  aria-hidden="false"
  aria-labelledby="fooTab"
  class="c0 c1"
  id="fooPanel"
  role="tabpanel"
/>
`);
});
