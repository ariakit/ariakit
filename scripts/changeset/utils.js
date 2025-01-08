import * as path from "path";

/**
 * Get the version of a specified package from the ${repo_name} packages directory from inputs
 * and validae for presence for each input
 *
 * @param void
 * @returns {{repo_name:string, packageName:string, version_increment:string}} Repo name, package name and version increment.
 */
const process_and_validate = () => {
  const repo_name = process.argv[2]; // Expecting repo name to be passed as a command-line argument
  const packageName = process.argv[3]; // Expecting package name to be passed as a command-line argument
  const version_increment = process.argv[4]; // Expecting version increment to be passed as a command-line argument

  if (!repo_name) {
    console.error("No repo name provided.");
    process.exit(1);
  }
  if (!packageName) {
    console.error("No package name provided.");
    process.exit(1);
  }
  if (!version_increment) {
    console.error("No version_increment provided.");
    process.exit(1);
  }

  return { repo_name, packageName, version_increment };
};

/**
 * Get the version of a specified package from the ${repo_name} packages directory.
 *
 * @param {string} output - The response of create empty changeset command.
 * @returns {{changesetFilePath: string, changesetFile: string}} File path and name.
 */
const extract_and_return_file_path_and_name = (output) => {
  const changesetPathMatch = output.match(/\.changeset\/([a-z-]+\.md)/);

  if (!changesetPathMatch || !changesetPathMatch[1]) {
    console.error("No changeset file path found in the command output.");
    process.exit(1);
  }

  const __dirname = process.cwd();

  const changesetFilePath = __dirname + "/.changeset/" + changesetPathMatch[1];
  const changesetFile = path.basename(changesetFilePath);

  return { changesetFilePath, changesetFile };
};

/**
 * To increment the prerelease version of the package.
 *
 * @param {string} currentVersion - The current version of package in package.json
 * @param {string} preTag - The Pre tag used for pre-release
 * @returns {string} File path and name.
 */
function incrementPreReleaseVersion(currentVersion, preTag) {
  const [baseVersion, preReleasePart] = currentVersion.split("-");

  if (preReleasePart == undefined) {
    console.error("preReleasePart Not found");
    process.exit(1);
  } else {
    const [, preReleaseNumber] = preReleasePart.split(".");
    if (preReleaseNumber == undefined) {
      console.error("preReleaseNumber Not found");
      process.exit(1);
    } else {
      const newPreReleaseNumber = parseInt(preReleaseNumber, 10) + 1;
      return `${baseVersion}-${preTag}.${newPreReleaseNumber}`;
    }
  }
}

/**
 * To start a new prerelease version of the package.
 *
 * @param {string} currentVersion - The current version of the package in package.json
 * @param {string} preTag - The Pre tag used for the prerelease
 * @returns {string} The new prerelease version starting from `1`.
 */
function startPreReleaseVersion(currentVersion, preTag) {
  return `${currentVersion}-${preTag}.1`;
}

/**
 * To reset the version to a normal (non-prerelease) version.
 *
 * @param {string} currentVersion - The current version of the package in package.json, which might include a pre-release tag.
 * @returns {string} The normal version (without the pre-release tag) in the format "major.minor.patch".
 */
function resetVersionToNormal(currentVersion) {
  const versions = currentVersion.split("-")[0];
  if (!versions) {
    console.error(
      "Invalid version format resetVersionToNormal",
      currentVersion,
    );
    process.exit(1);
  } else {
    const [major, minor, patch] = versions.split(".");
    return `${major}.${minor}.${patch}`;
  }
}

/**
 * To increment the version of a package based on the specified increment type.
 *
 * @param {string} currentVersion - The current version of the package in "major.minor.patch" format.
 * @param {string} versionIncrement - The type of version increment to apply. Can be "major", "minor", or "patch".
 * @returns {string} The new version string after applying the specified increment.
 * @throws {Error} If an unknown version increment type is provided.
 */
function incrementVersion(currentVersion, versionIncrement) {
  const [major = "", minor = "", patch = ""] = currentVersion
    .split(".")
    .map(Number);

  if (
    (major && isNaN(major)) ||
    (minor && isNaN(minor)) ||
    (patch && isNaN(patch))
  ) {
    console.error("Invalid version format in incrementVersion", currentVersion);
    process.exit(1);
  }

  switch (versionIncrement) {
    case "major":
      return `${+major + 1}.0.0`;
    case "minor":
      return `${major}.${+minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${+patch + 1}`;
    default:
      throw new Error(`Unknown version increment: ${versionIncrement}`);
  }
}

export {
  process_and_validate,
  extract_and_return_file_path_and_name,
  incrementPreReleaseVersion,
  startPreReleaseVersion,
  resetVersionToNormal,
  incrementVersion,
};
