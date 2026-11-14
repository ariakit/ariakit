import {
  Avatar,
  AvatarImage,
} from "@ariakit/ui/components/avatar.ariakit.react";

interface Person {
  name: string;
  /** What the avatar shows, as a caption under it. */
  state: string;
  photo?: string;
}

/** A drawn portrait that stands in for the URL of a photo. */
function getPortrait(color: string) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">',
    `<rect width="40" height="40" fill="${color}"/>`,
    '<circle cx="20" cy="16" r="7" fill="#fff7ed"/>',
    '<path d="M6 40c2-9 7-13 14-13s12 4 14 13z" fill="#fff7ed"/>',
    "</svg>",
  ].join("");
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const people: Person[] = [
  { name: "Hana Kobayashi", state: "Photo", photo: getPortrait("#d97706") },
  // This source is not an image, so the photo fails to load.
  { name: "Tom Becker", state: "Failed photo", photo: "data:image/png,0" },
  { name: "Rosa Delgado", state: "No photo" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Example() {
  return (
    <ul aria-label="Photos" className="flex gap-6 text-sm">
      {people.map((person) => (
        <li key={person.name} className="grid justify-items-center gap-2">
          {/* The avatar stands alone, so the label names it. The photo is
              decorative, and the initials show while it loads or if it fails. */}
          <Avatar aria-label={person.name} $layer="brand" $size={14}>
            {person.photo && <AvatarImage src={person.photo} />}
            {getInitials(person.name)}
          </Avatar>
          <span className="ak-ink-70">{person.state}</span>
        </li>
      ))}
    </ul>
  );
}
