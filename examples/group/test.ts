import { getByRole } from "@ariakit/test";

test("markup", () => {
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
