import { useState } from "react";
import { SandpackBundlerFiles } from "@codesandbox/sandpack-client";
import { useUpdateEffect } from "ariakit-utils/hooks";
import { PlaygroundState } from "../playground-state";

const DEFAULT_DEPENDENCIES = {
  // TODO: Remove ariakit and use latest on react when v18 gets released.
  ariakit: "next",
  react: "experimental",
  "react-dom": "experimental",
  "react-scripts": "latest",
  typescript: "latest",
};

export function getCodeSandboxEntryContent(filename: string) {
  return `import { createRoot } from "react-dom";
import App from "./src/${filename}";
createRoot(document.getElementById("root")).render(<App />);
`;
}

export function getSandpackFiles(values: PlaygroundState["values"]) {
  const files: SandpackBundlerFiles = {};
  for (const [file, code] of Object.entries(values)) {
    files[`/src/${file}`] = { code };
  }
  return files;
}

export function getCodeSandboxFiles(values: PlaygroundState["values"]) {
  const files: Record<string, { content: string; isBinary: boolean }> = {};
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
