import { useState } from "react";
import { useUpdateEffect } from "@ariakit/react-core/utils/hooks";
import { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import { PlaygroundState } from "../playground-state";

const DEFAULT_DEPENDENCIES = {
  react: "latest",
  "react-dom": "latest",
  "react-scripts": "latest",
  typescript: "latest",
};

// TODO: This should be configurable.
export function getCodeSandboxEntryContent(filename: string) {
  return `import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./src/${filename}";
createRoot(document.getElementById("root")).render(<App />);
`;
}

// TODO: This should be configurable.
function getCodeSandboxStyleContent() {
  return `@import url("https://unpkg.com/tailwindcss@^3.0.0/lib/css/preflight.css");

body {
  min-height: 100vh;
  padding-top: min(10vh, 100px);
  line-height: 1.5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
}

#root {
  display: flex;
  justify-content: center;
}
`;
}

export function getSandpackFiles(values: PlaygroundState["values"]) {
  const files: SandpackBundlerFiles = {
    "/style.css": { code: getCodeSandboxStyleContent() },
  };
  for (const [file, code] of Object.entries(values)) {
    files[`/src/${file}`] = { code };
  }
  return files;
}

export function getCodeSandboxFiles(values: PlaygroundState["values"]) {
  const files: Record<string, { content: string; isBinary: boolean }> = {
    "/style.css": {
      content: getCodeSandboxStyleContent(),
      isBinary: false,
    },
  };
  for (const [file, content] of Object.entries(values)) {
    files[`/src/${file}`] = { content, isBinary: false };
  }
  return files;
}

export function getCodeSandboxDependencies(
  values: PlaygroundState["values"],
  dependencies: Record<string, string> = DEFAULT_DEPENDENCIES
) {
  let hasNewDependencies = false;
  const nextDependencies = { ...dependencies };

  Object.values(values).forEach((value) => {
    const matches = value.matchAll(/import[^"']+['"]([^\."'][^'"]*)['"]/g);
    for (const [, match] of matches) {
      if (!match) continue;
      // Scoped dependency
      let [, dependency] = match.match(/^(@[^\/]+\/[^\/]+)/) || [];
      if (!dependency) {
        // Normal dependency
        [, dependency] = match.match(/^([^\/]+)/) || [];
      }
      if (dependency && !nextDependencies[dependency]) {
        hasNewDependencies = true;
        nextDependencies[dependency] = "latest";
      }
    }
  });

  if (hasNewDependencies) {
    return nextDependencies;
  }
  return dependencies;
}

export function useCodeSandboxDependencies(
  values: PlaygroundState["values"],
  timeout = 2000
) {
  const [dependencies, setDependencies] = useState(() =>
    getCodeSandboxDependencies(values, DEFAULT_DEPENDENCIES)
  );

  useUpdateEffect(() => {
    const id = setTimeout(() => {
      setDependencies((prevDependencies) =>
        getCodeSandboxDependencies(values, prevDependencies)
      );
    }, timeout);
    return () => clearTimeout(id);
  }, [values, timeout]);

  return dependencies;
}
