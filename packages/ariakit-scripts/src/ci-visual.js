/**
 * @param {string} stepName
 */
export function getVisualPlatform(stepName) {
  const match = stepName.match(/^Upload screenshots \(([^)]+)\)$/);
  return match?.[1];
}
