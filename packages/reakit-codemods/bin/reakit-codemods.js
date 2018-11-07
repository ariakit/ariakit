#!/usr/bin/env node

/* eslint-disable no-console */
const chalk = require("chalk");
const parse = require("yargs-parser");
const { spawn } = require("child_process");
const path = require("path");

const pkg = require("../package.json");

const help = chalk`
  ${pkg.description}

  {underline Usage}
    $ reakit-codemod <transformation type> <folder or file>

  {underline Options}
    --help            Displays this message

  {underline Examples}
    $ reakit-codemod --help
    $ reakit-codemod v016 src

  {underline Available Codemods}
    v016 - Changes made on the v016 version
`;

const end = () => process.exit(0);

const spawnCodeshift = (transformationFile, target) =>
  new Promise((resolve, reject) => {
    const jscodeshiftPath = path.resolve(
      path.join(__dirname, "../node_modules/.bin/jscodeshift")
    );
    const transformationPath = path.resolve(
      path.join(__dirname, `../src/transformations/${transformationFile}.js`)
    );

    const jscodeShiftProcess = spawn(
      jscodeshiftPath,
      ["-t", transformationPath, target],
      {
        stdio: "inherit",
        shell: true
      }
    );

    jscodeShiftProcess.on("error", error => {
      reject(error);
    });

    jscodeShiftProcess.on("exit", code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });

// eslint-disable-next-line
const run = async () => {
  process.on("SIGINT", end);
  process.on("SIGTERM", end);

  const argv = parse(process.argv.slice(2));
  const transformationName = argv._[0];
  const fileOrFolder = argv._[1];

  if (argv.help) {
    return console.log(help);
  }

  if (!transformationName) {
    console.error(chalk.red("No transformation specified, aborting."));
    end();
  }

  if (!fileOrFolder) {
    console.error(chalk.red("No file/folder specified, aborting."));
    end();
  }

  try {
    await spawnCodeshift(transformationName, fileOrFolder);
    process.exitCode = 0;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
