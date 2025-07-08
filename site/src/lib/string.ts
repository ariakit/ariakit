export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRandomId(prefix = "id-") {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}`;
}
