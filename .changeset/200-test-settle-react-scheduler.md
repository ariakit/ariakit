---
"@ariakit/test": patch
---

Hardened interaction settling under load

The settle that runs after each simulated interaction now drains pending React work before resolving. React 18 renders concurrently while interactions run, so under CPU contention it can split a render or commit across several scheduler tasks; a fixed delay could return between two of them and leave the DOM momentarily unsettled. Waiting for those slices to finish makes assertions after `click`, `press`, `type`, and the other helpers reliable under load.
