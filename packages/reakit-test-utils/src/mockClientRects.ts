// @ts-ignore
window.Element.prototype.getClientRects = function getClientRects() {
  const isHidden = (element: Element) => {
    if (element.parentElement && isHidden(element.parentElement)) {
      return true;
    }
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    return (
      element.style.display === "none" ||
      element.style.visibility === "hidden" ||
      element.hidden
    );
  };

  if (isHidden(this)) {
    return [];
  }
  return [{ width: 1, height: 1 }];
};
