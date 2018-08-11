const getSectionContent = section =>
  section.hasExamples ? section.props.examples : section.content;

export default getSectionContent;
