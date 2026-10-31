import { runCIGate, runCIPlan } from "./ci.ts";

function getEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function runCICommand(command: string | undefined) {
  if (command === "plan") {
    runCIPlan({
      base: getEnvironmentVariable("BASE_SHA"),
      head: getEnvironmentVariable("HEAD_SHA"),
      baseRef: getEnvironmentVariable("BASE_REF"),
      output: getEnvironmentVariable("GITHUB_OUTPUT"),
    });
    return;
  }

  if (command === "gate") {
    await runCIGate({
      plan: process.env.CI_PLAN,
      results: getEnvironmentVariable("CI_RESULTS"),
      repository: getEnvironmentVariable("GITHUB_REPOSITORY"),
      runId: getEnvironmentVariable("GITHUB_RUN_ID"),
      token: getEnvironmentVariable("GITHUB_TOKEN"),
    });
    return;
  }

  throw new Error(`Unknown CI command: ${command ?? ""}`);
}

await runCICommand(process.argv[2]);
