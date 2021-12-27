import { getByRole, render } from "ariakit-test-utils";
import Example from ".";

test("render group", () => {
  render(<Example />);
  expect(getByRole("group")).toMatchInlineSnapshot(`
   <div
     class="group"
     role="group"
   >
     <button
       class="button"
       data-command=""
       type="button"
     >
       Button 1
     </button>
     <button
       class="button"
       data-command=""
       type="button"
     >
       Button 2
     </button>
     <button
       class="button"
       data-command=""
       type="button"
     >
       Button 3
     </button>
   </div>
  `);
});
