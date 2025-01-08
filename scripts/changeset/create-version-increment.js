import * as fs from "fs";
import {
  incrementVersion,
  incrementPreReleaseVersion,
  startPreReleaseVersion,
  resetVersionToNormal,
} from "./utils.js";

/**
 * To increment the version of a package based on the specified increment type.
 *
 * @param {string} repo_name - The repo name to be passed as a command-line argument.
 * @param {string} package_name - The package name that needs to be version incremented.
 * @param {string} version_increment - The type of version increment to apply. Can be "major", "minor", "patch", "pre-alpha", "pre-beta".
 *
 * @returns {{ currentVersion:string, newVersion:string }} The new version string after applying the specified increment.
 * @throws {Error} If an unknown version increment type is provided.
 */
const createVersionIncrement = (repo_name, package_name, version_increment) => {
  const packagePath = `./packages/${repo_name}-${package_name}/package.json`;

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    if (!packageJson) {
      console.error(
        `Package.json not found for ${package_name}. Check if the package exists.`,
      );
      process.exit(1);
    }

    // Extract the version from the package.json file
    let currentVersion = packageJson.version;
    console.log(`Current version of ${package_name}: ${currentVersion}`);
    let newVersion;

    const isPreRelease = currentVersion.includes("-");
    if (version_increment.startsWith("pre-")) {
      const preTag = version_increment.split("-")[1] || "alpha";
      if (isPreRelease) {
        const currentPreTag = currentVersion.split("-")[1].split(".")[0];
        if (currentPreTag == preTag) {
          newVersion = incrementPreReleaseVersion(currentVersion, preTag);
        } else {
          let resetVersion = resetVersionToNormal(currentVersion);
          newVersion = startPreReleaseVersion(resetVersion, preTag);
        }
      } else {
        newVersion = startPreReleaseVersion(currentVersion, preTag);
      }
    } else {
      if (isPreRelease) {
        let resetVersion = resetVersionToNormal(currentVersion);
        newVersion = incrementVersion(resetVersion, version_increment);
        currentVersion = resetVersion;
      } else {
        newVersion = incrementVersion(currentVersion, version_increment);
      }
    }

    console.log(`New version of ${package_name}: ${newVersion}`);

    // Update the package.json file with the new version
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

    console.log(
      `${package_name} package.json version updated to: ${newVersion}`,
    );

    return { currentVersion, newVersion };
  } catch (error) {
    console.error(
      `Error reading or updating package.json for ${package_name}:`,
      error,
    );
    process.exit(1);
  }
};

export default createVersionIncrement;
