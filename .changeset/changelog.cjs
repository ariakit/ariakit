/** @type {import("@changesets/types").ChangelogFunctions["getDependencyReleaseLine"]} */
async function getDependencyReleaseLine(_, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) return "";
  const updatedDepenenciesList = dependenciesUpdated.map(
    (dependency) => `\`${dependency.name}@${dependency.newVersion}\``,
  );
  return `- Updated dependencies: ${updatedDepenenciesList.join(", ")}`;
}

/** @type {import("@changesets/types").ChangelogFunctions["getReleaseLine"]} */
async function getReleaseLine(changeset) {
  const [firstLine, ...nextLines] = changeset.summary
    .split("\n")
    .map((l) => l.trimEnd());

  if (!nextLines.length) return `- ${firstLine}`;

  return `### ${firstLine}\n${nextLines.join("\n")}`;
}

/**
 * @param {Array<Promise<string>} changelogLines
 */
async function getTextForType(changelogLines) {
  const lines = await Promise.all(changelogLines);
  if (!lines.length) return "";

  const headingLines = lines.filter((l) => l.startsWith("###"));
  const otherLines = lines.filter((l) => !l.startsWith("###"));
  if (!headingLines.length && !otherLines.length) return "";

  const other = otherLines.join("\n");
  if (!headingLines.length) return other;

  const heading = headingLines.join("\n\n");
  if (!otherLines.length) return heading;

  return `${heading}\n\n### Other updates\n\n${other}`;
}

/**
 * @param {import("@changesets/types").ModCompWithPackage} release
 * @param {Record<"major" | "minor" | "patch", Array<Promise<string>>} changelogLines
 */
async function getChangelogEntry(release, changelogLines) {
  const v0 = release.newVersion.startsWith("0.");

  // const date = new Date().toLocaleDateString("en-US", {
  //   month: "long",
  //   day: "numeric",
  //   year: "numeric",
  // });

  const major = await getTextForType(changelogLines["major"]);
  const minor = await getTextForType(changelogLines["minor"]);
  const patch = await getTextForType(changelogLines["patch"]);

  return [
    `## ${release.newVersion}`,
    major || (v0 && minor),
    v0 && patch,
    !v0 && minor,
    !v0 && patch,
  ]
    .flat()
    .filter(Boolean)
    .join("\n\n");
}

module.exports = {
  getDependencyReleaseLine,
  getReleaseLine,
  getChangelogEntry,
};
