/* istanbul ignore file */
import { Polygon } from "./polygon";

function getPolygon() {
  const id = "debug-polygon";
  const existingPolygon = document.getElementById(id);
  if (existingPolygon) {
    return existingPolygon;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.fill = "green";
  svg.style.opacity = "0.2";
  svg.style.position = "fixed";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "999999";
  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygon.setAttribute("id", id);
  polygon.setAttribute("points", "0,0 0,0");
  svg.appendChild(polygon);
  document.body.appendChild(svg);
  return polygon;
}

export function debugPolygon(polygon: Polygon) {
  const polygonElement = getPolygon();
  const points = polygon.map((point) => point.join(",")).join(" ");
  polygonElement.setAttribute("points", points);
  // Return SVG element
  return polygonElement.parentElement;
}
