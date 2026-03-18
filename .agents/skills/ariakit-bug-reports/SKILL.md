---
name: ariakit-bug-reports
description: Bug report investigation workflow for this repository. Use when working on bug reports or issues.
---

# Bug Reports

- Start by reproducing the bug in a sandbox in the `site` workspace and add an automated test that fails for the reported behavior. Most bug reports include a StackBlitz URL with the user's reproduction. You should always open that URL and review the code for reference. At this point, you should commit your changes and create a draft PR so we can see the failed CI checks. Then start working on the workaround.
- If you need to adjust the tests later because they weren't accurate, make sure they fail without any workaround or library fix applied. Push that so we can validate it in CI, then reapply the workaround or library fix and keep going.
- All bug report investigations should produce a workaround before any library fix is proposed or implemented.
- Keep the library code unchanged while investigating the workaround. The workaround should be demonstrated first in userland code.
- Workarounds should follow the repository pattern: prefer a small consumer-side change that users can apply in their own app, such as an explicit prop override, a local event handler, a store method call, or a more specific callback condition.
- A workaround must preserve the user-facing features that motivated the bug report whenever possible. Do not remove components or disable behavior unless that tradeoff is explicitly unavoidable and clearly stated.
- Validate the workaround in the same repro sandbox by updating the userland code until the previously failing test passes.
- Once the workaround is in place, push the changes, with the workaround applied to the sandbox, to the PR so we can see the CI checks pass, and update the PR description with a "Workaround" section. The section should explain the problem and the workaround itself. It should also include a code block with the workaround applied. It doesn't need to be the full code, just the necessary snippet so the user can understand it and apply it to their own code before we make a release. Make sure to include a short `TODO` comment in the code block with the GitHub issue URL so it's clear the code is temporary and can be removed once the fix lands.
- After that, revert the workaround and start working on the proper library fix. Once it's fixed, update the PR description with the final explanation of the problem and the solution. The workaround section must stay. Push the changes and mark the PR ready for review.
