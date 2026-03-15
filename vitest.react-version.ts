/**
 * Patches Node.js module resolution to redirect react/react-dom imports
 * to aliased versions based on REACT_VERSION env var. This handles CJS
 * require() calls that bypass Vite's resolve.alias system.
 *
 * Used as vitest's setupFiles (runs before each test file).
 */
import Module, { createRequire } from "node:module";
import { dirname } from "node:path";

const REACT_VERSION = process.env.REACT_VERSION;
if (REACT_VERSION) {
  const require = createRequire(import.meta.url);

  // Map of bare specifier prefixes to their aliased package directories.
  const redirects: Array<{ prefix: string; dir: string }> = [
    {
      prefix: "react-dom",
      dir: dirname(require.resolve(`react-dom-${REACT_VERSION}/package.json`)),
    },
    {
      prefix: "react",
      dir: dirname(require.resolve(`react-${REACT_VERSION}/package.json`)),
    },
  ];

  if (REACT_VERSION === "17") {
    redirects.push(
      {
        prefix: "@testing-library/react",
        dir: dirname(require.resolve("testing-library-react-12/package.json")),
      },
      {
        prefix: "@testing-library/dom",
        dir: dirname(require.resolve("testing-library-dom-8/package.json")),
      },
    );
  }

  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (
    request: string,
    parent: unknown,
    ...rest: unknown[]
  ) {
    for (const { prefix, dir } of redirects) {
      if (request === prefix || request.startsWith(`${prefix}/`)) {
        const redirected = request.replace(prefix, dir);
        try {
          return origResolve.call(this, redirected, parent, ...rest);
        } catch {
          // Fall through to original resolution if redirect fails.
        }
      }
    }
    return origResolve.call(this, request, parent, ...rest);
  };
}
