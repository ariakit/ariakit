import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  bindSignedJob,
  decryptTransfer,
  encryptTransfer,
  measureEnvironment,
  rebindManifest,
  verifyTrustedPlan,
  writeRenderContext,
  writeTrustedPlan,
} from "@visonaut/playwright/ci";
import { verifyItemCoverage } from "./coverage.mjs";
import { collectionFor, projects, viewports } from "./repository.mjs";

const directory = import.meta.dirname;
const repositoryRoot =
  process.env.GITHUB_WORKSPACE ?? path.resolve(directory, "../..");
const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const results = path.join(repositoryRoot, "app/.visonaut-results");
const planFile = path.resolve(directory, "../visonaut-plan.json");
const browser = process.env.VISONAUT_BROWSER;
const project = projects[browser];
const [step, input] = process.argv.slice(2);

async function transferPrivateKey() {
  if (!project) throw new Error("Unknown Visonaut browser shard");
  const server = new URL(settings.server);
  const tokenUrl = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (
    server.protocol !== "https:" ||
    tokenUrl.protocol !== "https:" ||
    !tokenUrl.hostname.endsWith(".actions.githubusercontent.com") ||
    !requestToken
  ) {
    throw new Error("The signed submission identity is unavailable");
  }
  tokenUrl.searchParams.set("audience", new URL("/transfer-key", server).href);
  const identity = await fetch(tokenUrl, {
    headers: { Authorization: `Bearer ${requestToken}` },
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!identity.ok)
    throw new Error("The signed submission identity is unavailable");
  const token = (await identity.json()).value;
  if (typeof token !== "string" || !token) {
    throw new Error("The signed submission identity is invalid");
  }
  const response = await fetch(new URL("/v1/transfer/private-key", server), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      browser,
      workflowRunId: process.env.GITHUB_RUN_ID,
      workflowAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      testedSha: process.env.GITHUB_SHA,
    }),
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok || !response.body) {
    throw new Error("The transfer key is unavailable to this submission job");
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 4096) throw new Error("The transfer key response is too large");
    chunks.push(chunk);
  }
  const key = new TextDecoder().decode(Buffer.concat(chunks));
  if (
    !/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----\n?$/.test(
      key,
    )
  ) {
    throw new Error("The transfer key response is invalid");
  }
  return key;
}

if (step === "plan") {
  const current = JSON.parse(await readFile(planFile, "utf8"));
  const environmentProfileDigests = Object.fromEntries(
    current.shards.map((shard) => [shard.key, shard.environmentProfileDigests]),
  );
  const shards = Object.keys(projects).map((key) => ({
    key,
    jobName: `capture / ${key}`,
    collection: collectionFor(key),
  }));
  const { planDigest } = await writeTrustedPlan(planFile, {
    directory,
    settings,
    shards,
    environmentProfileDigests,
  });
  console.log(`Trusted plan digest: ${planDigest}`);
} else if (step === "probe") {
  if (!project) throw new Error("Unknown Visonaut browser shard");
  const result = await measureEnvironment({
    appPackageFile: path.join(repositoryRoot, "app/package.json"),
    outputDirectory: results,
    browserName: browser,
    device: project.device,
    viewports,
    comparisonPolicy: settings.comparisonPolicy,
    comparisonEngineVersion: settings.comparisonEngineVersion,
    applicationFontPackage: "@fontsource-variable/inter",
  });
  console.log(
    `Measured ${result.environmentProfiles.length} ${browser} profiles`,
  );
} else if (step === "render-context") {
  await writeRenderContext({
    directory: results,
    workflowRunId: process.env.GITHUB_RUN_ID,
    workflowAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    testedSha: process.env.GITHUB_SHA,
  });
} else if (step === "items") {
  await verifyTrustedPlan({ directory, planFile });
  const registry = JSON.parse(
    await readFile(path.join(directory, "items.json"), "utf8"),
  );
  const manifest = JSON.parse(
    await readFile(path.join(results, "manifest.json"), "utf8"),
  );
  const { requiredItems, requiredVariants, addedItems, addedVariants } =
    verifyItemCoverage(registry, manifest, browser);
  console.log(
    `Validated ${requiredItems} required ${browser} items, ${requiredVariants} variants, ${addedItems} new items, and ${addedVariants} new variants`,
  );
} else if (step === "encrypt") {
  await verifyTrustedPlan({ directory, planFile });
  await encryptTransfer(
    results,
    browser,
    input,
    path.join(directory, "transfer-public.pem"),
  );
} else if (step === "submit") {
  await verifyTrustedPlan({ directory, planFile });
  await decryptTransfer(input, results, browser, await transferPrivateKey());
  const context = await bindSignedJob({
    directory: results,
    repository: settings.repository,
    server: settings.server,
    browser,
    workflowRunId: process.env.GITHUB_RUN_ID,
    workflowAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    testedSha: process.env.GITHUB_SHA,
    tokenRequestUrl: process.env.ACTIONS_ID_TOKEN_REQUEST_URL,
    tokenRequestToken: process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
    githubToken: process.env.GH_TOKEN,
  });
  await rebindManifest({
    directory: results,
    browser,
    repository: settings.repository,
    repositoryId: settings.repositoryId,
    context,
  });
} else if (step === "receipt-name") {
  const receipt = JSON.parse(
    await readFile(path.join(results, "receipt.json"), "utf8"),
  );
  if (
    !/^visonaut-discovery-[1-9][0-9]*-[1-9][0-9]*-(chromium|firefox|webkit)-[a-f0-9]{64}$/.test(
      receipt.artifactName,
    )
  ) {
    throw new Error("Invalid discovery receipt name");
  }
  await appendFile(process.env.GITHUB_OUTPUT, `name=${receipt.artifactName}\n`);
} else {
  throw new Error("Unknown trusted Visonaut CI step");
}
