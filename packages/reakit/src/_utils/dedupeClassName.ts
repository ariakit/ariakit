const dedupeClassName = (className?: string) =>
  className &&
  className
    .split(" ")
    .filter((part, i, parts) => i === parts.indexOf(part))
    .join(" ");

export default dedupeClassName;
