const path = require("path");
const { spawn } = require("child_process");

function spawnCLI(transformationFile, pathOrFile) {
  return new Promise((resolve, reject) => {
    const processSpawned = spawn(process.execPath, [
      path.resolve("../../bin/reakit-codemod.js"),
      transformationFile,
      pathOrFile
    ]);

    processSpawned.on("close", code => {
      resolve(code);
    });

    processSpawned.on("error", error => {
      reject(error);
    });
  });
}

module.exports = spawnCLI;
