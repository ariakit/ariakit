import importToRequire from "../importToRequire";

test("importToRequire", () => {
  expect(
    importToRequire(
      [
        "import foo from 'foo'",
        "import bar from 'bar/baz';",
        "import { foo } from 'bar';",
        "import { foo as bar } from 'foo'"
      ].join("\n")
    )
  ).toBe(
    [
      "const foo = require('foo').default || require('foo');",
      "const bar = require('bar/baz').default || require('bar/baz');",
      "const { foo } = require('bar');",
      "const { foo: bar } = require('foo');"
    ].join("\n")
  );
});
