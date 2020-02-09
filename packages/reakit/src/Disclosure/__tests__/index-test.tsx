import * as React from "react";
import { render, click } from "reakit-test-utils";
import { DisclosureRegion, Disclosure, useDisclosureState } from "..";

test("show", () => {
  function Test() {
    const disclosure = useDisclosureState();
    return (
      <>
        <Disclosure {...disclosure}>disclosure</Disclosure>
        <DisclosureRegion {...disclosure}>content</DisclosureRegion>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const content = getByText("content");
  expect(content).not.toBeVisible();
  click(disclosure);
  expect(content).toBeVisible();
});

test("hide", () => {
  function Test() {
    const disclosure = useDisclosureState({ visible: true });
    return (
      <>
        <Disclosure {...disclosure}>disclosure</Disclosure>
        <DisclosureRegion {...disclosure}>content</DisclosureRegion>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const content = getByText("content");
  expect(content).toBeVisible();
  click(disclosure);
  expect(content).not.toBeVisible();
});

test("multiple components", () => {
  function Test() {
    const disclosure1 = useDisclosureState();
    const disclosure2 = useDisclosureState();
    return (
      <>
        <Disclosure {...disclosure1}>
          {props => (
            <Disclosure {...props} {...disclosure2}>
              disclosure
            </Disclosure>
          )}
        </Disclosure>
        <DisclosureRegion {...disclosure1}>content1</DisclosureRegion>
        <DisclosureRegion {...disclosure2}>content2</DisclosureRegion>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const content1 = getByText("content1");
  const content2 = getByText("content2");
  expect(content1).not.toBeVisible();
  expect(content2).not.toBeVisible();
  click(disclosure);
  expect(content1).toBeVisible();
  expect(content2).toBeVisible();
});
