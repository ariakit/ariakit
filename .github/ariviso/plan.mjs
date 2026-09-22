import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { digestJson, sha256, projects, collectionFor } from "./identity.mjs";

export async function createPlan() {
  const settings = JSON.parse(
    await readFile(new URL("settings.json", import.meta.url), "utf8"),
  );
  const environments = JSON.parse(
    await readFile(new URL("environments.json", import.meta.url), "utf8"),
  );
  const source = [];
  for (const file of (await readdir(import.meta.dirname)).sort()) {
    if (!/\.(mjs|json)$/.test(file)) continue;
    source.push({
      file,
      digest: sha256(await readFile(path.join(import.meta.dirname, file))),
    });
  }
  const plan = {
    schemaVersion: "1.0",
    repositoryId: settings.repositoryId,
    workflow: settings.workflow,
    invocation: ["playwright", "test", "--config", "playwright.config.mjs"],
    discovery: { executorDigest: digestJson(source) },
    shards: Object.keys(projects).map((browser) => {
      const environmentProfileDigests = environments[browser];
      if (
        !Array.isArray(environmentProfileDigests) ||
        !environmentProfileDigests.length ||
        environmentProfileDigests.some(
          (digest) => !/^[a-f0-9]{64}$/.test(digest),
        )
      ) {
        throw new Error(
          `Register measured ${browser} environment profiles before capture`,
        );
      }
      return {
        key: browser,
        jobName: `capture / ${browser}`,
        collection: collectionFor(browser),
        environmentProfileDigests,
      };
    }),
  };
  return { plan, planDigest: digestJson(plan), settings };
}

if (import.meta.main) {
  const { plan, planDigest } = await createPlan();
  // The service reads the whole plan from trusted main. Keep it outside this
  // directory so the executor digest does not include its own generated plan.
  const destination = new URL("../ariviso-plan.json", import.meta.url);
  await writeFile(destination, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(
    JSON.stringify({
      planDigest,
      executorDigest: plan.discovery.executorDigest,
    }),
  );
}
