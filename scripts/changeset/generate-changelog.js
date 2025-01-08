import createVersionIncrement from "./create-version-increment.js";
import { getGitLogs } from "./get-git-logs.js";
import { process_and_validate } from "./utils.js";

const {
  repo_name,
  packageName: package_name,
  version_increment,
} = process_and_validate();

const { currentVersion, newVersion } = createVersionIncrement(
  repo_name,
  package_name,
  version_increment,
);

console.log(">>>>>> Current Version", currentVersion);
console.log(">>>>>> New Version", newVersion);

const gitLogs = getGitLogs(repo_name, package_name, currentVersion, newVersion);

console.log(">>>>>. GIT LOGS", gitLogs);
