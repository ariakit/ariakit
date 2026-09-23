export const projects = {
  chromium: {
    name: "chrome",
    device: "Desktop Chrome",
    os: "ubuntu-24.04",
    kinds: ["chrome", "browser"],
  },
  firefox: {
    name: "firefox",
    device: "Desktop Firefox",
    os: "ubuntu-24.04",
    kinds: ["firefox", "browser"],
  },
  webkit: {
    name: "safari",
    device: "Desktop Safari",
    os: "macos-15",
    kinds: ["safari", "browser"],
  },
};

export const viewports = [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 400, height: 800 },
  { width: 1440, height: 900 },
  { width: 560, height: 900 },
  { width: 560, height: 400 },
];

export function collectionFor(browser) {
  const project = projects[browser];
  if (!project) throw new Error("Unknown Visonaut browser shard");
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
