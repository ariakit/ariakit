import { renderHook } from "react-hooks-testing-library";
import { useRovingState } from "../RovingState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(props: Parameters<typeof useRovingState>[0] = {}) {
  return renderHook(useRovingState, { initialProps: props }).result;
}

test.skip("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "autoSelect": false,
  "enabled": Array [],
  "focusedRef": null,
  "loop": false,
  "orientation": "horizontal",
  "refs": Array [],
  "selectedRef": null,
}
`);
});

// test("initial state refs", () => {
//   const result = render({ refs: [1, 2, 3] });
//   expect(result.current).toMatchInlineSnapshot(
//     { refs: [1, 2, 3] },
//     `
// Object {
//   "autoSelect": false,
//   "enabled": Array [],
//   "focusedRef": null,
//   "loop": false,
//   "orientation": "horizontal",
//   "refs": Array [
//     1,
//     2,
//     3,
//   ],
//   "selectedRef": null,
// }
// `
//   );
// });

// test("focus", () => {
//   const result = render({ refs: [1, 2, 3] });
//   expect(result.current.focusedRef).toBeNull();
//   act(() => result.current.focus(2));
//   expect(result.current).toMatchInlineSnapshot({ focusedRef: 2 });
// });

// test("show", () => {
//   const result = render();
//   act(result.current.show);
//   expect(result.current).toEqual(
//     expect.objectContaining({
//       visible: true
//     })
//   );
// });
