// @vitest-environment jsdom
// The "check/uncheck item after filtering" test relies on React concurrent
// rendering to settle the filtered list; under happy-dom's faster rAF cadence it
// doesn't settle in time on slower CI, failing there even with a retry (it
// passes locally). Pinned to jsdom.
import "../combobox-multiple/test.ts";
