import isComponentSection from "./isComponentSection";

const ROOT = "https://github.com/diegohaz/reakit/tree/master";

const TYPE_OPTIONS = ["component", "doc"];

const EXTENSIONS = {
  component: "js",
  doc: "md"
};

/**
 * Generates a github url for the source of a given section. This could be to the documentation
 * markdown file, or the source file of a given component.
 * @param {Object} section The styleguidest section
 * @param {"component"|"doc"} type What to link to. the component source, or the markdown documentation source?
 */
export default function getComponentGithubSrcUrl(section, type) {
  if (TYPE_OPTIONS.indexOf(type) === -1) {
    throw new Error("Invalid source type, must be one of 'component' or 'doc'");
  }

  if (!section.filepath) {
    return null;
  }

  if (type === "component" && !isComponentSection(section)) {
    return null;
  }

  const filePathWithoutExtension = section.filepath.split(".")[0];
  const newExtension = EXTENSIONS[type];

  return `${ROOT}/${filePathWithoutExtension}.${newExtension}`;
}
