import * as React from "react";
import { render, focus } from "reakit-test-utils";
import { hasFocusWithin } from "../hasFocusWithin";

test("hasFocusWithin", () => {
  const { getByLabelText: $ } = render(
    <>
      <div aria-label="item1">
        <button aria-label="item1-1" />
      </div>
      <button aria-label="item2" />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div aria-label="item3" tabIndex={0} aria-activedescendant="item3-1">
        <div aria-label="item3-1" id="item3-1" />
      </div>
    </>
  );
  expect(hasFocusWithin($("item1"))).toBe(false);
  focus($("item1-1"));
  expect(hasFocusWithin($("item1"))).toBe(true);
  expect(hasFocusWithin($("item2"))).toBe(false);
  focus($("item2"));
  expect(hasFocusWithin($("item2"))).toBe(true);
  expect(hasFocusWithin($("item3-1"))).toBe(false);
  focus($("item3"));
  expect(hasFocusWithin($("item3"))).toBe(true);
  expect(hasFocusWithin($("item3-1"))).toBe(true);
});
