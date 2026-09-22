# Capture-only measurement

This PR workflow measures the complete Ariviso visual collection before the integration merges. It uses Ubuntu 24.04 for Chromium and Firefox and macOS 15 for WebKit. It preserves the trusted capture workflows, pins, plan, and environment allowlists. It requests no OIDC token and makes no Ariviso service requests.

Each browser runs the full collection three times in separate Playwright processes against the same application build. Each process keeps the existing retry policy. A private report records every test attempt, and the Playwright blob retains attachments and traces from failed and successful attempts. Final images come only from each test's final successful attempt. A failed or incomplete pass remains a failed measurement, even if another pass succeeds.

The measurement compares decoded RGBA values exactly between each pair of complete passes. These measurements do not substitute for the Ariviso server comparator, trusted upload evidence, or Worker peak-memory evidence. A complete measurement can contain pixel or profile differences; inspect its comparison counts before choosing a policy.

## Private evidence

All profiles, image originals, test names, failure details, source hashes, raw logs, blob reports, and per-capture comparisons are packed and encrypted on the runner. The committed RSA public key wraps a fresh AES-256-GCM key for each archive. The corresponding private key is held outside the repository by the measurement operator and never enters GitHub Actions. Public artifacts contain only `evidence.enc` and aggregate `summary.json`.

Download the artifact into a private directory. With the matching local private key, decrypt it before extracting the archive:

```js
import { readFile } from "node:fs/promises";
import { decryptFile } from "./encrypt.mjs";

await decryptFile(
  "/private/evidence.enc",
  "/private/evidence.tar.gz",
  await readFile("/private/measurement-key.pem", "utf8"),
);
```

The decryptor publishes its output only after authentication succeeds. Preserve the private key until the encrypted evidence has been downloaded and verified. Do not upload decrypted archives, profiles, manifests, or failed-attempt media to a public repository.

The workflow needs the existing checksum-pinned adapter download URL. It installs no CLI package. Its public metrics contain counts, timings, public GitHub run/SHA identity, and content hashes, without test names, paths, or error messages. Ordinary CI artifact expiration still applies to the encrypted files.

## Verification

Run `node --test .github/ariviso-measure/*.test.mjs` with the executor's pinned dependencies installed in `.github/ariviso/node_modules`. These tests use synthetic PNG bytes and do not capture browser screenshots locally. Hosted screenshots run only through the dedicated PR workflow.
