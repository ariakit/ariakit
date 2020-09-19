import * as React from "react";
import { render } from "reakit-test-utils";
import { Button } from "../../Button";
import { Separator } from "../Separator";

test("render", () => {
  const { baseElement } = render(<Separator />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <hr />
      </div>
    </body>
  `);
});

test("render vertical", () => {
  const { baseElement } = render(<Separator orientation="vertical" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <hr
          aria-orientation="vertical"
        />
      </div>
    </body>
  `);
});

test("render custom tag", () => {
  const { baseElement } = render(<Separator as="div" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          role="separator"
        />
      </div>
    </body>
  `);
});

test("render custom tag vertical", () => {
  const { baseElement } = render(<Separator as="div" orientation="vertical" />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-orientation="vertical"
          role="separator"
        />
      </div>
    </body>
  `);
});

test("render custom Element", () => {
  const { baseElement } = render(<Separator as={Button} />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          role="separator"
          type="button"
        />
      </div>
    </body>
  `);
});

test("render custom Element vertical", () => {
  const { baseElement } = render(
    <Separator as={Button} orientation="vertical" />
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-orientation="vertical"
          role="separator"
          type="button"
        />
      </div>
    </body>
  `);
});
