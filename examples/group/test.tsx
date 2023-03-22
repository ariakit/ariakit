import { getByRole, render } from "@ariakit/test";
import Example from "./index.jsx";

test("markup", () => {
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
       Bold
     </button>
     <button
       class="button"
       data-command=""
       type="button"
     >
       Italic
     </button>
     <button
       class="button"
       data-command=""
       type="button"
     >
       Underline
     </button>
   </div>
  `);
});
