export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRandomId(prefix = "id-") {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}`;
}

export function trimLeft(str: string, chars: string) {
  return str.replace(new RegExp(`^[${chars}]+`), "");
}

export function trimRight(str: string, chars: string) {
  return str.replace(new RegExp(`[${chars}]+$`), "");
}
