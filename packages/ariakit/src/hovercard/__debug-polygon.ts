import { Polygon } from "./__utils";

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
  svg.style.opacity = "0.15";
  svg.style.position = "fixed";
  svg.style.pointerEvents = "none";
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
}
