// @ts-check
/** @type {import("@changesets/types").ChangelogFunctions} */
const changelogFunctions = {
  getDependencyReleaseLine: async (_, dependenciesUpdated) => {
    if (dependenciesUpdated.length === 0) return "";
    const updatedDepenenciesList = dependenciesUpdated.map(
      (dependency) => `\`${dependency.name}@${dependency.newVersion}\``
    );
    return `\n- Updated dependencies: ${updatedDepenenciesList.join(", ")}.`;
  },
  getReleaseLine: async (changeset) => {
    const [firstLine, ...nextLines] = changeset.summary
      .split("\n")
      .map((l) => l.trimEnd());

    let returnVal = `\n\n- ${firstLine}`;

    if (nextLines.length > 0) {
      returnVal += `\n${nextLines.map((l) => `  ${l}`).join("\n")}`;
    }

    return returnVal;
  },
};

module.exports = changelogFunctions;
