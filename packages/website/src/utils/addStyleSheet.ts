function addStyleSheet(stylesPath: string) {
  const link = document.createElement("link");

  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", stylesPath);

  document.head.appendChild(link);
}

export default addStyleSheet;
