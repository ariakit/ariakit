import { execSync } from "node:child_process";

/**
 * Get the version of a specified package from the ${repo_name} packages directory.
 *
 * @param {string} repo_name - The name of the repository.
 * @param {string} packageName - The name of the package to fetch the version for.
 * @param {string} version - The version from which the logs needs to be fetched till head.new_version
 * @param {string} new_version - The version from which the logs needs to be fetched till head.new_version
 *
 * @returns {string} The git log output.
 */
export function getGitLogs(repo_name, packageName, version, new_version) {
  // const gitLogCommand = `git log --oneline @${repo_name}/${packageName}@${version}..HEAD -- ./packages/${repo_name}-${packageName} > ./packages/${repo_name}-${packageName}/releases/${packageName}@${version}.md`;
  // const gitLogCommand = `mkdir -p ./packages/${repo_name}-${packageName}/releases && \
  //  git log --oneline @${repo_name}/${packageName}@${version}..HEAD -- ./packages/${repo_name}-${packageName} > ./packages/${repo_name}-${packageName}/releases/${packageName}@${new_version}.md`
  // console.log(">>> GIT COMMAND Ran >>>", gitLogCommand);

  try {
    execSync("git fetch --tag");

    // Get the git log output
    const gitLogOutput = execSync(
      `git log --oneline @${repo_name}/${packageName}@${version}..HEAD -- ./packages/${repo_name}-${packageName}`,
      { encoding: "utf-8" },
    ).trim();

    // Create directory and write to file
    const mkdirCommand = `mkdir -p ./packages/${repo_name}-${packageName}/releases`;
    execSync(mkdirCommand);

    // Write the output to file
    const filePath = `./packages/${repo_name}-${packageName}/releases/${packageName}@${new_version}.md`;
    execSync(`echo "${gitLogOutput}" > "${filePath}"`);

    console.log(">>> Git logs written to file:", filePath);

    return gitLogOutput;
  } catch (err) {
    throw new Error(`Failed to execute git log command: ${err}`);
  }
}
