import type {
  GetDependencyReleaseLine,
  GetReleaseLine,
  ModCompWithPackage,
} from "@changesets/types";

/**
 * Besides the standard Changesets `getReleaseLine` and
 * `getDependencyReleaseLine` functions, this module exports a non-standard
 * `getChangelogEntry` hook. It only works because
 * patches/@changesets__apply-release-plan@7.1.1.patch makes upstream's
 * getChangelogEntry delegate to it instead of rendering the default
 * "### Major/Minor/Patch Changes" sections.
 *
 * When bumping @changesets/apply-release-plan, regenerate the patch with
 * `pnpm patch @changesets/apply-release-plan`, re-insert the hook before the
 * final return of getChangelogEntry in
 * dist/changesets-apply-release-plan.cjs.js, run `pnpm patch-commit <dir>`,
 * and verify with
 * `pnpm test .changeset/get-changelog-entry.test.ts`.
 */

interface ChangelogLines {
  major: Array<Promise<string>>;
  minor: Array<Promise<string>>;
  patch: Array<Promise<string>>;
}

export async function getDependencyReleaseLine(
  _: Parameters<GetDependencyReleaseLine>[0],
  dependenciesUpdated: Parameters<GetDependencyReleaseLine>[1],
) {
  if (dependenciesUpdated.length === 0) return "";
  const updatedDependenciesList = dependenciesUpdated.map(
    (dependency) => `\`${dependency.name}@${dependency.newVersion}\``,
  );
  return `- Updated dependencies: ${updatedDependenciesList.join(", ")}`;
}

export async function getReleaseLine(changeset: Parameters<GetReleaseLine>[0]) {
  const [firstLine, ...nextLines] = changeset.summary
    .split("\n")
    .map((line) => line.trimEnd());

  if (!nextLines.length) return `- ${firstLine}`;

  return `### ${firstLine}\n${nextLines.join("\n")}`;
}

async function getChangelogText(changelogLines: Array<Promise<string>>) {
  const lines = await Promise.all(changelogLines);
  if (!lines.length) return "";

  const isOverviewLine = (line: string) => line.startsWith("### Overview\n");
  const isHeadingLine = (line: string) => line.startsWith("###");
  const isOtherLine = (line: string) => !line.startsWith("###");

  const headingLines = lines
    .filter(isHeadingLine)
    .sort((a, b) => {
      if (isOverviewLine(a)) return -1;
      if (isOverviewLine(b)) return 1;
      return 0;
    })
    .map((line) => line.replace("### Overview\n\n", ""));

  const otherLines = lines.filter(isOtherLine);
  if (!headingLines.length && !otherLines.length) return "";

  const other = otherLines.join("\n");
  if (!headingLines.length) return other;

  const heading = headingLines.join("\n\n");
  if (!other.trim()) return heading;

  return `${heading}\n\n### Other updates\n\n${other}`;
}

export async function getChangelogEntry(
  release: ModCompWithPackage,
  changelogLines: ChangelogLines,
) {
  // const date = new Date().toLocaleDateString("en-US", {
  //   month: "long",
  //   day: "numeric",
  //   year: "numeric",
  // });
  const text = await getChangelogText(Object.values(changelogLines).flat());
  return `## ${release.newVersion}\n\n${text}`;
}
