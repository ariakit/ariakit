// Part of this code is based on
// https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/matches.ts,
// https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/get-node-text.ts,
// and
// https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/helpers.ts
// Original work licensed under the MIT License.

// Constant `node.nodeType` for text nodes, see:
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#node_type_constants
const TEXT_NODE = 3;

/**
 * Normalizes a string before it's compared against a matcher.
 */
export type NormalizerFn = (text: string) => string;

export interface DefaultNormalizerOptions {
  trim?: boolean;
  collapseWhitespace?: boolean;
}

export interface MatcherOptions {
  exact?: boolean;
  trim?: boolean;
  collapseWhitespace?: boolean;
  normalizer?: NormalizerFn;
}

export type MatcherFunction = (
  content: string,
  element: Element | null,
) => boolean;

export type Matcher = string | RegExp | number | MatcherFunction;

function assertNotNullOrUndefined<T>(
  matcher: T,
): asserts matcher is NonNullable<T> {
  if (matcher === null || matcher === undefined) {
    // `matcher` is null/undefined in this branch; String() makes the
    // conversion to text explicit for the diagnostic message.
    const passed = String(matcher);
    throw new Error(
      `It looks like ${passed} was passed instead of a matcher. Did you do something like getByText(${passed})?`,
    );
  }
}

/**
 * Resets the `lastIndex` of a global regular expression so repeated `test`
 * calls behave consistently while matching multiple elements.
 */
function matchRegExp(matcher: RegExp, text: string): boolean {
  const match = matcher.test(text);
  if (matcher.global && matcher.lastIndex !== 0) {
    console.warn(
      `To match all elements we had to reset the lastIndex of the RegExp because the global flag is enabled. We encourage to remove the global flag from the RegExp.`,
    );
    matcher.lastIndex = 0;
  }
  return match;
}

/**
 * Returns whether `textToMatch` loosely contains `matcher`, used for "fuzzy"
 * label/text matching where partial substrings are acceptable.
 */
export function fuzzyMatches(
  textToMatch: string | null,
  node: Element | null,
  matcher: Matcher,
  normalizer: NormalizerFn,
): boolean {
  if (typeof textToMatch !== "string") return false;
  assertNotNullOrUndefined(matcher);
  const normalizedText = normalizer(textToMatch);
  if (typeof matcher === "string" || typeof matcher === "number") {
    return normalizedText
      .toLowerCase()
      .includes(matcher.toString().toLowerCase());
  }
  if (typeof matcher === "function") {
    return matcher(normalizedText, node);
  }
  return matchRegExp(matcher, normalizedText);
}

/**
 * Returns whether `textToMatch` exactly matches `matcher` after normalization.
 */
export function matches(
  textToMatch: string | null,
  node: Element | null,
  matcher: Matcher,
  normalizer: NormalizerFn,
): boolean {
  if (typeof textToMatch !== "string") return false;
  assertNotNullOrUndefined(matcher);
  const normalizedText = normalizer(textToMatch);
  if (matcher instanceof Function) {
    return matcher(normalizedText, node);
  }
  if (matcher instanceof RegExp) {
    return matchRegExp(matcher, normalizedText);
  }
  return normalizedText === String(matcher);
}

/**
 * Returns a normalizer that optionally trims and collapses whitespace.
 */
export function getDefaultNormalizer({
  trim = true,
  collapseWhitespace = true,
}: DefaultNormalizerOptions = {}): NormalizerFn {
  return (text) => {
    let normalizedText = text;
    normalizedText = trim ? normalizedText.trim() : normalizedText;
    normalizedText = collapseWhitespace
      ? normalizedText.replace(/\s+/g, " ")
      : normalizedText;
    return normalizedText;
  };
}

/**
 * Constructs a normalizer for the `matches`/`fuzzyMatches` functions. When a
 * custom `normalizer` is provided, `trim` and `collapseWhitespace` cannot be
 * combined with it.
 */
export function makeNormalizer({
  trim,
  collapseWhitespace,
  normalizer,
}: {
  trim?: boolean;
  collapseWhitespace?: boolean;
  normalizer?: NormalizerFn;
}): NormalizerFn {
  if (!normalizer) {
    // No custom normalizer specified. Just use the default.
    return getDefaultNormalizer({ trim, collapseWhitespace });
  }
  if (
    typeof trim !== "undefined" ||
    typeof collapseWhitespace !== "undefined"
  ) {
    // A custom normalizer cannot be combined with trim or collapseWhitespace
    // because their order of application would be ambiguous.
    throw new Error(
      "trim and collapseWhitespace are not supported with a normalizer. " +
        "If you want to use the default trim and collapseWhitespace logic in your normalizer, " +
        'use "getDefaultNormalizer({trim, collapseWhitespace})" and compose that into your normalizer',
    );
  }
  return normalizer;
}

/**
 * Returns the direct text of a node. For submit/button/reset inputs it returns
 * the `value`; otherwise it joins the text of direct text-node children.
 */
export function getNodeText(node: HTMLElement): string {
  if (
    node.matches("input[type=submit], input[type=button], input[type=reset]")
  ) {
    return (node as HTMLInputElement).value;
  }
  return Array.from(node.childNodes)
    .filter(
      (child) => child.nodeType === TEXT_NODE && Boolean(child.textContent),
    )
    .map((child) => child.textContent)
    .join("");
}
