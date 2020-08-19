const { execSync } = require("child_process");
const log = require("../log");

const ALLOW_LIST = ["yarn.lock"];

function getModifiedFiles() {
  const statusOutput = execSync("git status --short").toString();

  return statusOutput
    .split("\n")
    .filter((file) => file.length > 0 && !ALLOW_LIST.includes(file))
    .map((file) => file.slice(3));
}

const modifiedFiles = getModifiedFiles();

if (modifiedFiles.length === 0) {
  log("Looks great!");
  process.exit(0);
}

log(
  `${
    "here are modified files after running the build, did you forget to checkin after building?\n\n" +
    "Files changed:\n"
  }${modifiedFiles.join("\n")}`
);

process.exit(1);
