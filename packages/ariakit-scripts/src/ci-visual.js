/**
 * @param {string} stepName
 */
export function getVisualProject(stepName) {
  const match = stepName.match(/^Upload screenshots \(([^)]+)\)$/);
  return match?.[1]?.toLowerCase();
}
