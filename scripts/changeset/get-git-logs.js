import { execSync } from "child_process";

/**
 * Get the version of a specified package from the ${repo_name} packages directory.
 *
 * @param {string} repo_name - The name of the repository.
 * @param {string} packageName - The name of the package to fetch the version for.
 * @param {string} version - The version from which the logs needs to be fetched till head.
 *
 * @returns {string} The git log output.
 */
export function getGitLogs(repo_name, packageName, version) {
  const gitLogCommand = `git log --oneline @${repo_name}/${packageName}@${version}..HEAD -- ./packages/${repo_name}-${packageName}`;

  console.log(">>> GIT COMMAND Ran >>>", gitLogCommand);

  try {
    execSync("git fetch --tag");
    const output = execSync(gitLogCommand, { encoding: "utf-8" });
    return output;
  } catch (err) {
    throw new Error(`Failed to execute git log command: ${err}`);
  }
}
