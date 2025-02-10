import { q } from "@ariakit/test";

test("has role", () => {
  const qq = q.within(document.getElementById("role"));

  expect(qq.group()).toMatchInlineSnapshot(`
    <div
      role="group"
    >
      <button>
        button 1
      </button>
      <button>
        button 2
      </button>
      <button>
        button 3
      </button>
    </div>
  `);
});

test("uses label from GroupLabel", () => {
  const qq = q.within(document.getElementById("label"));

  expect(qq.group()).toHaveAccessibleName("My custom label");
});
