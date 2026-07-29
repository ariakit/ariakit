import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { globSync } from "glob";
import { afterAll, beforeAll, expect, test } from "vitest";
import { getProjectTestPatterns } from "./vitest.config.ts";

const projects = ["node", "dom", "react", "solid"] as const;

const testCases = [
  {
    file: "packages/ariakit-scripts/src/generic.test.ts",
    projects: ["node"],
  },
  {
    file: "packages/ariakit-scripts/src/explicit.dom.test.ts",
    projects: ["dom"],
  },
  {
    file: "packages/ariakit-react/src/generic.test.ts",
    projects: ["react"],
  },
  {
    file: "packages/ariakit-react/src/explicit.dom.test.ts",
    projects: ["dom"],
  },
  {
    file: "packages/ariakit-components/src/generic.test.ts",
    projects: ["dom"],
  },
  {
    file: "packages/ariakit-components/src/explicit.react.test.ts",
    projects: ["react"],
  },
  {
    file: "app/src/lib/generic.test.ts",
    projects: ["node"],
  },
  {
    file: "app/src/lib/explicit.dom.test.ts",
    projects: ["dom"],
  },
] as const;

let fixturePath: string;

beforeAll(async () => {
  fixturePath = await mkdtemp(join(tmpdir(), "ariakit-vitest-config-"));
  await Promise.all(
    testCases.map(async ({ file }) => {
      const path = join(fixturePath, file);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, "");
    }),
  );
});

afterAll(async () => {
  await rm(fixturePath, { recursive: true, force: true });
});

test.each(testCases)(
  "assigns $file to $projects",
  ({ file, projects: expectedProjects }) => {
    const actualProjects = projects.filter((project) => {
      const { exclude, include } = getProjectTestPatterns(project);
      const files = globSync(include, {
        cwd: fixturePath,
        ignore: exclude,
        nodir: true,
      });
      return files.includes(file);
    });

    expect(actualProjects).toEqual(expectedProjects);
  },
);
