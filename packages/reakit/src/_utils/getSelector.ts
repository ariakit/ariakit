function getSelector(object: any): string {
  if (object != null && object.styledComponentId) {
    return `.${object.styledComponentId}`;
  }
  return "";
}

export default getSelector;
