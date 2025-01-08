import { execSync } from "child_process";
import * as fs from "fs";
import { getGitLogs } from "./get-git-command.mjs";
import {
  process_and_validate,
  extract_and_return_file_path_and_name,
} from "./utils.js";

const { repo_name, packageName, version_increment } = process_and_validate();

// Step 1: Run the npx command to create an empty changeset and capture the output
const output = execSync("npx changeset add --empty", { encoding: "utf-8" });

// Step 2: Extract the changeset file path and name
const { changesetFilePath, changesetFile } =
  extract_and_return_file_path_and_name(output);

// Step 3: Get all git logs based on package name
const gitlogs = getGitLogs(repo_name, packageName);
console.log(">>> ALL GIT LOGS ARE>>>", gitlogs);

// Step 4: Update the changeset file
let content = fs.readFileSync(changesetFilePath, "utf8");
const updatedContent = content.replace(
  "---\n---",
  `---\n"@locoui/${packageName}": ${version_increment === "pre" ? "patch" : version_increment}\n--- \n\n${gitlogs}\n`,
);
fs.writeFileSync(changesetFilePath, updatedContent);

console.log(
  `Changeset file ${changesetFile} updated successfully for package ${packageName}.`,
);
