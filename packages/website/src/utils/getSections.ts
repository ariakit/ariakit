import { Section } from "./types";

const getSections = (section: Section) => [
  ...(section.sections || []),
  ...(section.components || [])
];

export default getSections;
