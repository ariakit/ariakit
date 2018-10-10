import { Section } from "./types";

const getSectionContent = (section: Section) =>
  section.hasExamples ? section.props.examples : section.content;

export default getSectionContent;
