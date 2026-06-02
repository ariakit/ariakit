// @vitest-environment jsdom
//
// The "check/uncheck item after filtering" test relies on React concurrent
// rendering, whose settle timing flakes on CI under happy-dom's faster rAF
// cadence. It runs here, so this file is pinned to jsdom.
import "../combobox-multiple/test.ts";
