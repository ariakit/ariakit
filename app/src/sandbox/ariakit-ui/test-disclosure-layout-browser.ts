import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "disclosure" },
  async ({ test, query }) => {
    test("draws the edge of a framed group once", async ({ q }) => {
      const article = q.article("Framed group");
      const account = query(article).button("Account");
      // The member roots are the group's children, and the button is the first
      // child of its member.
      const member = account.locator("xpath=..");
      const group = member.locator("xpath=..");
      // On a light surface the frame draws its edge as a ring outside the box,
      // so a border inside it would double the top and bottom edges.
      await test.expect(group).toHaveCSS("border-top-width", "0px");
      await test.expect(group).toHaveCSS("border-bottom-width", "0px");
      await test.expect(group).toHaveCSS("box-shadow", /0px 0px 0px 1px/);
      // The first member rounds with the card, concentric with its edge.
      await test.expect(member).toHaveCSS("border-radius", "12px 12px 0px 0px");
    });
  },
);
