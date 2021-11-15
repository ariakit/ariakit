export function resolveModule(path: string, availableFilenames: string[]) {
  const normalizedPath = path.replace(/^\.\/(.+)\/?$/, "$1");
  const paths = [
    normalizedPath,
    `${normalizedPath}.ts`,
    `${normalizedPath}.tsx`,
    `${normalizedPath}.js`,
    `${normalizedPath}.jsx`,
    `${normalizedPath}/index.ts`,
    `${normalizedPath}/index.tsx`,
    `${normalizedPath}/index.js`,
    `${normalizedPath}/index.jsx`,
  ];
  for (const filename of paths) {
    if (availableFilenames.includes(filename)) {
      return filename;
    }
  }
  return null;
}
