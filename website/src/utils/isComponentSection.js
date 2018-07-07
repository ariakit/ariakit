export default function isComponentSection(section) {
  return Boolean(
    section.filepath && section.filepath.startsWith("src/components")
  );
}
