import { runCIGate, runCIPlan } from "./ci.ts";

function getEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function runCICommand(command: string | undefined) {
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
    runCIGate({
      plan: getEnvironmentVariable("CI_PLAN"),
      results: getEnvironmentVariable("CI_RESULTS"),
    });
    return;
  }

  throw new Error(`Unknown CI command: ${command ?? ""}`);
}

runCICommand(process.argv[2]);
