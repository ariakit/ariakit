import { importToRequire } from "../importToRequire";

test("importToRequire", () => {
  expect(
    importToRequire(
      [
        "import foo from 'foo'",
        "import bar from 'bar/baz';",
        "import { foo } from 'bar';",
        "import { foo, bar } from 'bar';",
        "import { foo as bar } from 'foo'",
        "import foo, { bar } from 'foo';",
        "import foo, { bar, baz } from 'foo';",
        "import foo, { bar, baz as qux } from 'foo';",
        "import * as foo from 'foo';",
        "import foo, {",
        "  bar,",
        "  baz as qux",
        "} from 'foo';",
        "import {",
        "  foo as bar,",
        "  baz as qux",
        "} from 'foo';"
      ].join("\n")
    )
  ).toMatchInlineSnapshot(`
    "const foo = require('foo').default || require('foo');
    const bar = require('bar/baz').default || require('bar/baz');
    const { foo } = require('bar');
    const { foo, bar } = require('bar');
    const { foo: bar } = require('foo');
    const foo = require('foo').default || require('foo');
    const { bar } = require('foo');
    const foo = require('foo').default || require('foo');
    const { bar, baz } = require('foo');
    const foo = require('foo').default || require('foo');
    const { bar, baz: qux } = require('foo');
    const foo = require('foo');
    const foo = require('foo').default || require('foo');
    const {
      bar,
      baz: qux
    } = require('foo');
    const {
      foo: bar,
      baz: qux
    } = require('foo');"
  `);
});
