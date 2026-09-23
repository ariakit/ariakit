# Visonaut trusted capture

This directory holds the small executor that runs Ariakit's existing `@visual` tests. The tests still prepare pages and call `visual()` once for each variant. The executor provides the fixed browser collection, measures the runner, and transfers encrypted captures to a separate signed upload job. It does not define a second visual test suite.

The reusable workflow checks out these files at its own reviewed commit and installs the exact public npm packages from `package-lock.json`. The service loads `../visonaut-plan.json` from Ariakit `main` and accepts only the configured reusable workflow SHA. A pull request cannot change either trusted source by editing its own checkout.

`../visonaut-plan.json` lists the measured runner profile digests. Refresh those lists from diagnostic probe artifacts when the pinned runner images or fonts change, then run `node executor.mjs plan` to update the executor digest. Update the service's executor digest and workflow SHA together after the reviewed change reaches `main`.
