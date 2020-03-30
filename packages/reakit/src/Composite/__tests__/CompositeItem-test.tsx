import * as React from "react";
import { render, focus, press, click } from "reakit-test-utils";
import {
  unstable_CompositeItemProps,
  unstable_CompositeItem as CompositeItem
} from "../CompositeItem";

const props: unstable_CompositeItemProps = {
  items: [
    { id: "1", ref: { current: null } },
    { id: "2", ref: { current: null } },
    { id: "3", ref: { current: null } }
  ],
  currentId: "2",
  setCurrentId: jest.fn(),
  registerItem: jest.fn(),
  unregisterItem: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  up: jest.fn(),
  down: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { container } = render(<CompositeItem {...props} id="1" />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <button
        id="1"
        tabindex="-1"
      />
    </div>
  `);
});

test("render current", () => {
  const { container } = render(<CompositeItem {...props} id="2" />);
  expect(container).toMatchInlineSnapshot(`
<div>
  <button
    id="2"
    tabindex="0"
  />
</div>
`);
});

test("render without state props", () => {
  // @ts-ignore
  const { container } = render(<CompositeItem id="1" />);
  expect(container).toMatchInlineSnapshot(`
<div>
  <button
    id="1"
    tabindex="0"
  />
</div>
`);
});

test("interact without state props", () => {
  // @ts-ignore
  const { getByLabelText } = render(<CompositeItem aria-label="item" id="1" />);
  const item = getByLabelText("item");
  focus(item);
  expect(item).toHaveFocus();
  press.ArrowUp();
  press.Delete();
  click(item);
});

test("render aria-activedescendant", () => {
  const { container } = render(
    <CompositeItem {...props} id="1" unstable_virtual />
  );
  expect(container).toMatchInlineSnapshot(`
<div>
  <button
    id="1"
    tabindex="-1"
  />
</div>
`);
});

test("render aria-activedescendant current", () => {
  const { container } = render(
    <CompositeItem {...props} id="2" unstable_virtual />
  );
  expect(container).toMatchInlineSnapshot(`
<div>
  <button
    aria-selected="true"
    id="2"
    tabindex="-1"
  />
</div>
`);
});
