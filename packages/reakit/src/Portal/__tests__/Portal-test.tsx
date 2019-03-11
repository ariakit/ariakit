import * as React from "react";
import { render } from "react-testing-library";
import { Portal } from "../Portal";

test("render", () => {
  const { baseElement } = render(<Portal>test</Portal>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="portal"
  >
    test
  </div>
</body>
`);
});

test("render nested", () => {
  const { baseElement } = render(
    <Portal>
      test
      <Portal>test2</Portal>
    </Portal>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="portal"
  >
    test
    <div
      class="portal"
    >
      test2
    </div>
  </div>
</body>
`);
});

test("render nested and sibling", () => {
  const { baseElement } = render(
    <>
      <Portal>
        test
        <Portal>test2</Portal>
      </Portal>
      <Portal>test3</Portal>
    </>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="portal"
  >
    test
    <div
      class="portal"
    >
      test2
    </div>
  </div>
  <div
    class="portal"
  >
    test3
  </div>
</body>
`);
});
