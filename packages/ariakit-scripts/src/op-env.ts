import { spawnSync } from "node:child_process";
import { getCommandOutput, readPackageJson, runCommand } from "./utils.ts";

interface EnvCommand {
  bin: string;
  args: string[];
  includeProcessEnv: boolean;
}

const gitConfigKey = "ariakit.op-env";
const previewScripts = new Set(["preview-app", "preview-app-lite"]);

function isRawCommand(rawArgs: string[]) {
  const commandIndex = rawArgs.indexOf("op-env");
  if (commandIndex === -1) return false;
  return rawArgs[commandIndex + 1] === "--";
}

function isHelpCommand(args: string[]) {
  const [command] = args;
  return !command || command === "--help" || command === "-h";
}

function printHelp() {
  console.error(
    [
      "Usage: ariakit op-env <script> [args...]",
      "       ariakit op-env -- <command> [args...]",
      "",
      "Run a root script or arbitrary command with a 1Password Environment.",
    ].join("\n"),
  );
}

function getRepositoryRoot() {
  return getCommandOutput(
    "git",
    ["rev-parse", "--show-toplevel"],
    process.cwd(),
  );
}

function getEnvironmentId(rootPath: string) {
  const result = spawnSync(
    "git",
    ["config", "--local", "--get", gitConfigKey],
    {
      cwd: rootPath,
      encoding: "utf-8",
    },
  );

  if (result.error) throw result.error;
  if (result.status === 0) return result.stdout.trim() || undefined;
  if (result.status === 1) return;

  throw new Error(`git config failed with ${result.status}`);
}

function printConfigurationHelp() {
  console.error(
    [
      "No 1Password Environment is configured for this repository.",
      "",
      "1. In 1Password, open Developer > Environments.",
      "2. Open the environment and select Manage environment > Copy environment ID.",
      "3. From this repository, run:",
      "",
      `   git config --local ${gitConfigKey} <environment-id>`,
      "",
      "Then retry with `pnpm op-env <script>`.",
    ].join("\n"),
  );
}

function getEnvCommand(
  rootPath: string,
  args: string[],
  rawCommand: boolean,
): EnvCommand {
  const [command, ...commandArgs] = args;
  if (!command) {
    throw new Error("Missing command. Use `ariakit op-env <script>`.");
  }
  if (command === "op-env") {
    throw new Error("The op-env script cannot invoke itself.");
  }

  const packageJson = readPackageJson(rootPath);
  if (!rawCommand && packageJson.scripts?.[command]) {
    return {
      bin: "pnpm",
      args: ["run", command, ...commandArgs],
      includeProcessEnv: previewScripts.has(command),
    };
  }

  return {
    bin: command,
    args: commandArgs,
    includeProcessEnv: false,
  };
}

export async function runWithOpEnv(args: string[]) {
  if (isHelpCommand(args)) {
    printHelp();
    process.exitCode = args.length ? 0 : 1;
    return;
  }

  const rootPath = getRepositoryRoot();
  const environmentId = getEnvironmentId(rootPath);
  if (!environmentId) {
    printConfigurationHelp();
    process.exitCode = 1;
    return;
  }

  const command = getEnvCommand(rootPath, args, isRawCommand(process.argv));
  const env = command.includeProcessEnv
    ? { ...process.env, CLOUDFLARE_INCLUDE_PROCESS_ENV: "true" }
    : undefined;

  process.exitCode = await runCommand(
    "op",
    ["run", "--environment", environmentId, "--", command.bin, ...command.args],
    { cwd: rootPath, env },
  );
}
