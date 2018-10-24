#!/usr/bin/env node

/* eslint-disable no-console */
const chalk = require("chalk");
const parse = require("yargs-parser");
const { spawn } = require("child_process");
const path = require("path");

const pkg = require("../../package.json");

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

const spawnCodeshift = (transformationFile: string, target: string) =>
  new Promise((resolve, reject) => {
    const jscodeshiftPath = path.resolve(
      path.join(__dirname, "../node_modules/.bin/jscodeshift")
    );
    const transformationPath = path.resolve(
      path.join(__dirname, `../src/transformations/${transformationFile}`)
    );

    const jscodeShiftProcess = spawn(
      jscodeshiftPath,
      ["-t", transformationPath, target, "--parser", "babylon"],
      {
        stdio: "inherit",
        shell: true
      }
    );

    jscodeShiftProcess.on("error", (error: any) => {
      reject(error);
    });

    jscodeShiftProcess.on("exit", (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
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

  // const codeshiftProcess = await spawnCodeshift(
  //   transformationName,
  //   fileOrFolder
  // );

  // console.log("exited with copde", codeshiftProcess);
};

run();
