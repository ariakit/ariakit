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

    const match = changeset.id.match(/^(?:\d\-)?(?<number>\d+)/);
    const number = match?.groups?.number;
    const prefix = !number || firstLine.startsWith("[`#")
      ? ""
      : `[\`#${number}\`](https://github.com/ariakit/ariakit/pull/${number}) `;

    let returnVal = `\n\n- ${prefix}${firstLine}`;

    if (nextLines.length > 0) {
      returnVal += `\n${nextLines.map((l) => `  ${l}`).join("\n")}`;
    }

    return returnVal;
  },
};

module.exports = changelogFunctions;
