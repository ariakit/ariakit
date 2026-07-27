/**
 * @param {string} jobName
 */
export function getVisualProject(jobName) {
  const localName = jobName.split(" / ").at(-1);
  if (!localName?.startsWith("Test ")) return;
  return localName.slice(5).toLowerCase();
}
