import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { expect, test } from "vitest";
import config from "./oxlint.config.ts";

// These rules either enforce framework-neutral JSX invariants or only match
// React APIs that Solid source does not use.
const reactRulesKeptForSolid = [
  "react/forward-ref-uses-ref",
  "react/jsx-no-comment-textnodes",
  "react/jsx-no-duplicate-props",
  "react/jsx-no-script-url",
  "react/jsx-no-undef",
  "react/jsx-props-no-spread-multi",
  "react/no-danger-with-children",
  "react/no-did-mount-set-state",
  "react/no-did-update-set-state",
  "react/no-direct-mutation-state",
  "react/no-find-dom-node",
  "react/no-is-mounted",
  "react/no-render-return-value",
  "react/no-string-refs",
  "react/no-this-in-sfc",
  "react/no-unsafe",
  "react/no-will-update-set-state",
  "react/void-dom-elements-no-children",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(
  value: unknown,
  message: string,
): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(message);
  return value;
}

function getEnabledReactRules() {
  const oxlintPath = join(
    import.meta.dirname,
    "node_modules/oxlint/bin/oxlint",
  );
  const output = execFileSync(
    process.execPath,
    [oxlintPath, "--print-config", "app/src/example.react.tsx"],
    { encoding: "utf8" },
  );
  const printedConfig: unknown = JSON.parse(output);
  if (!isRecord(printedConfig)) return [];
  if (!isRecord(printedConfig.rules)) return [];
  return Object.entries(printedConfig.rules)
    .filter(
      ([rule, ruleConfig]) =>
        rule.startsWith("react/") && ruleConfig !== "allow",
    )
    .map(([rule]) => rule);
}

test("audits React lint rules for Solid sources", () => {
  const solidOverride = config.overrides?.find(({ files }) =>
    files.includes("**/*.solid.*"),
  );

  expect(solidOverride?.files).toEqual([
    "**/*.solid.*",
    "packages/ariakit-solid*/**",
  ]);
  const solidRules = requireRecord(
    solidOverride?.rules,
    "Expected the Solid override to configure rules",
  );

  const reactRules = getEnabledReactRules();
  expect(reactRules).not.toHaveLength(0);
  const disabledReactRules = Object.keys(solidRules);
  const auditedReactRules = [...disabledReactRules, ...reactRulesKeptForSolid];
  expect(new Set(auditedReactRules).size).toBe(auditedReactRules.length);
  expect(auditedReactRules.sort()).toEqual(reactRules.sort());
  for (const rule of disabledReactRules) {
    expect(solidRules[rule], rule).toBe("off");
  }
});
