import { Section } from "./types";

const firstSections = ["Box"];

const sortSections = (sections: Section[]) => [
  ...sections
    .filter(section => firstSections.includes(section.name))
    .sort(
      (a, b) => firstSections.indexOf(a.name) - firstSections.indexOf(b.name)
    ),
  ...sections.filter(section => !firstSections.includes(section.name))
];

export default sortSections;
