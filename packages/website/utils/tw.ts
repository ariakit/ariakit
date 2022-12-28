export default function tw(
  strings: TemplateStringsArray,
  ...interpolations: string[]
) {
  return strings
    .map((string, i) => string + (interpolations[i] || ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
