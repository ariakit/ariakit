// https://github.com/alexreardon/tiny-warning
const isProduction = process.env.NODE_ENV === "production";

const warnings: string[] = [];

export function warning(condition: boolean, message: string, label?: string) {
  if (!isProduction) {
    if (condition) return;

    const finalLabel = label ? `[reakit/${label}]\n` : "";
    const text = `${finalLabel}${message}`;

    if (warnings.indexOf(text) === -1) {
      // eslint-disable-next-line no-console
      console.warn(text);
      warnings.push(text);
    }

    // Throwing an error and catching it immediately to improve debugging
    // A consumer can use 'pause on caught exceptions'
    // https://github.com/facebook/react/issues/4216
    try {
      throw Error(text);
    } catch (x) {
      // do nothing
    }
  }
}
