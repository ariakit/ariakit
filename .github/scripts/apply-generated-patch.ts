import path from "node:path";

import {
  fileExists,
  getRequiredEnv,
  runCommand,
  setOutput,
} from "./lib/workflow.ts";

function determinePatchFile(): void {
  const artifactsDir = getRequiredEnv("ARTIFACTS_DIR");
  const ogImagesPatch = path.join(
    artifactsDir,
    "og-images-diff",
    "og-images.patch",
  );
  const buildStylesPatch = path.join(
    artifactsDir,
    "build-styles-diff",
    "build-styles.patch",
  );

  if (fileExists(ogImagesPatch)) {
    setOutput("file", ogImagesPatch);
    setOutput("message", "Update OG images");
    return;
  }
  if (fileExists(buildStylesPatch)) {
    setOutput("file", buildStylesPatch);
    setOutput("message", "Update styles");
  }
}

function applyPatch(): void {
  const patchFile = getRequiredEnv("PATCH_FILE");
  const workingDirectory = getRequiredEnv("WORKING_DIRECTORY");
  runCommand("git", ["apply", patchFile], { cwd: workingDirectory });
}

const command = process.argv[2];

if (command === "determine-patch-file") {
  determinePatchFile();
} else if (command === "apply-patch") {
  applyPatch();
} else {
  throw new Error(`Unknown command: ${command}`);
}
