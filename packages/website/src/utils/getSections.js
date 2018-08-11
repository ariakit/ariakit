const getSections = section => [
  ...(section.sections || []),
  ...(section.components || [])
];

export default getSections;
