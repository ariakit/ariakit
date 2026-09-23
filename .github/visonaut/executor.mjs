import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  bindSignedJob,
  decryptTransfer,
  encryptTransfer,
  measureEnvironment,
  rebindManifest,
  writeRenderContext,
  writeTrustedPlan,
} from "@visonaut/playwright/ci";

const directory = import.meta.dirname;
const repositoryRoot =
  process.env.GITHUB_WORKSPACE ?? path.resolve(directory, "../..");
const results = path.join(repositoryRoot, "app/.visonaut-results");
const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);

export const projects = {
  chromium: {
    name: "chrome",
    device: "Desktop Chrome",
    kinds: ["chrome", "browser"],
  },
  firefox: {
    name: "firefox",
    device: "Desktop Firefox",
    kinds: ["firefox", "browser"],
  },
  webkit: {
    name: "safari",
    device: "Desktop Safari",
    kinds: ["safari", "browser"],
  },
};

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function selectedBrowser() {
  const browser = required("VISONAUT_BROWSER");
  if (!Object.hasOwn(projects, browser)) {
    throw new Error("Unknown Visonaut browser shard");
  }
  return browser;
}

function collectionFor(browser) {
  const project = projects[browser];
  return {
    projectName: project.name,
    testDir: "app/src",
    testMatch: project.kinds.flatMap((kind) => [
      `**/test*-${kind}*.ts`,
      `**/tests/*-${kind}*.ts`,
    ]),
    testIgnore: [],
    grep: [{ source: "@visual", flags: "" }],
    grepInvert: [],
    shard: null,
    repeatEach: 1,
  };
}

async function writePlan() {
  const planFile = path.join(repositoryRoot, ".github/visonaut-plan.json");
  const currentPlan = JSON.parse(await readFile(planFile, "utf8"));
  const environmentProfileDigests = Object.fromEntries(
    currentPlan.shards.map(({ key, environmentProfileDigests }) => [
      key,
      environmentProfileDigests,
    ]),
  );
  const shards = Object.keys(projects).map((key) => ({
    key,
    jobName: `capture / ${key}`,
    collection: collectionFor(key),
  }));
  const { planDigest, plan } = await writeTrustedPlan(planFile, {
    directory,
    settings,
    shards,
    environmentProfileDigests,
  });
  process.stdout.write(
    `${JSON.stringify({ planDigest, executorDigest: plan.discovery.executorDigest })}\n`,
  );
}

async function probe(browser) {
  const { environmentProfiles, fonts } = await measureEnvironment({
    appPackageFile: path.join(repositoryRoot, "app/package.json"),
    outputDirectory: results,
    browserName: browser,
    device: projects[browser].device,
    viewports: [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
      { width: 400, height: 800 },
      { width: 1440, height: 900 },
      { width: 560, height: 900 },
      { width: 560, height: 400 },
    ],
    comparisonPolicy: settings.comparisonPolicy,
    comparisonEngineVersion: settings.comparisonEngineVersion,
    applicationFontPackage: "@fontsource-variable/inter",
  });
  process.stdout.write(
    `Measured ${environmentProfiles.length} ${browser} profiles and ${fonts.length} fonts\n`,
  );
}

async function renderContext() {
  await writeRenderContext({
    directory: results,
    workflowRunId: required("GITHUB_RUN_ID"),
    workflowAttempt: Number(required("GITHUB_RUN_ATTEMPT")),
    testedSha: required("GITHUB_SHA"),
  });
}

async function encrypt(browser) {
  await encryptTransfer(
    results,
    browser,
    path.join(required("RUNNER_TEMP"), `visonaut-${browser}.enc`),
    path.join(directory, "transfer-public.pem"),
  );
}

async function identityToken(audience) {
  const url = new URL(required("ACTIONS_ID_TOKEN_REQUEST_URL"));
  url.searchParams.set("audience", audience);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${required("ACTIONS_ID_TOKEN_REQUEST_TOKEN")}`,
    },
    redirect: "error",
  });
  if (!response.ok) {
    throw new Error(`GitHub identity request failed: ${response.status}`);
  }
  const body = await response.json();
  if (typeof body.value !== "string") {
    throw new Error("GitHub did not return an identity token");
  }
  return body.value;
}

async function submit(browser) {
  const workflowRunId = required("GITHUB_RUN_ID");
  const workflowAttempt = Number(required("GITHUB_RUN_ATTEMPT"));
  const testedSha = required("GITHUB_SHA");
  const keyToken = await identityToken(
    new URL("/transfer-key", settings.server).href,
  );
  const response = await fetch(
    new URL("/v1/transfer/private-key", settings.server),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        browser,
        workflowRunId,
        workflowAttempt,
        testedSha,
      }),
      redirect: "error",
    },
  );
  if (!response.ok) {
    throw new Error(`Visonaut transfer key request failed: ${response.status}`);
  }
  const privateKey = await response.text();
  await decryptTransfer(
    path.join(
      required("RUNNER_TEMP"),
      "visonaut-transfer",
      `visonaut-${browser}.enc`,
    ),
    results,
    browser,
    privateKey,
  );
  const context = await bindSignedJob({
    directory: results,
    repository: settings.repository,
    server: settings.server,
    browser,
    workflowRunId,
    workflowAttempt,
    testedSha,
    tokenRequestUrl: required("ACTIONS_ID_TOKEN_REQUEST_URL"),
    tokenRequestToken: required("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
    githubToken: required("GH_TOKEN"),
  });
  const receipt = await rebindManifest({
    directory: results,
    browser,
    repository: settings.repository,
    repositoryId: settings.repositoryId,
    context,
  });
  await appendFile(required("GITHUB_OUTPUT"), `name=${receipt.artifactName}\n`);
}

async function main() {
  const command = process.argv[2];
  if (command === "plan") {
    await writePlan();
    return;
  }
  const browser = selectedBrowser();
  if (command === "probe") {
    await probe(browser);
  } else if (command === "render-context") {
    await renderContext();
  } else if (command === "encrypt") {
    await encrypt(browser);
  } else if (command === "submit") {
    await submit(browser);
  } else {
    throw new Error("Unknown trusted executor command");
  }
}

if (import.meta.main) {
  await main();
}
