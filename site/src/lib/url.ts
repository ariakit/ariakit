import {
  type PlusAccountPath,
  type PlusCheckoutStep,
  PlusCheckoutStepSchema,
  type PlusType,
  PlusTypeSchema,
} from "./schemas.ts";

const DEFAULT_URL = new URL("http://localhost:4321");
const PLUS_ACCOUNT_PATH = "/plus/account";
const PLUS_CHECKOUT_PATH = "/plus/checkout";

function leadingSlash(path?: string | null) {
  return path ? `/${path}` : "";
}

function setRedirectURL(url: URL, redirectUrl?: string | URL) {
  if (!redirectUrl) return;
  const path = new URL(redirectUrl, url).toString().replace(url.origin, "");
  url.searchParams.set("redirect_url", encodeURIComponent(path));
}

export interface GetPlusAccountURLParams {
  url: string | URL;
  path?: PlusAccountPath;
  redirectUrl?: string | URL;
}

export function getPlusAccountURL({
  url,
  path,
  redirectUrl,
}: GetPlusAccountURLParams) {
  const nextUrl = new URL(url, DEFAULT_URL);
  nextUrl.pathname = `${PLUS_ACCOUNT_PATH}${leadingSlash(path)}`;
  setRedirectURL(nextUrl, redirectUrl);
  return nextUrl;
}

export function getPlusAccountPath(
  params: Partial<GetPlusAccountURLParams> = {},
) {
  const url = getPlusAccountURL({ url: DEFAULT_URL, ...params });
  return url.toString().replace(url.origin, "");
}

export interface GetPlusCheckoutURLParams {
  url: string | URL;
  type?: PlusType;
  step?: PlusCheckoutStep;
  redirectUrl?: string | URL;
}

export function getPlusCheckoutURL({
  url,
  step,
  type,
  redirectUrl,
}: GetPlusCheckoutURLParams) {
  const { step: _step = "login", type: _type = "personal" } =
    parsePlusCheckoutURL(url);
  type = type ?? _type;
  step = step ?? _step;
  const nextUrl = new URL(url, DEFAULT_URL);
  nextUrl.pathname = `${PLUS_CHECKOUT_PATH}${leadingSlash(step)}${leadingSlash(type)}`;
  setRedirectURL(nextUrl, redirectUrl);
  return nextUrl;
}

export function getPlusCheckoutPath(
  params: Partial<GetPlusCheckoutURLParams> = {},
) {
  const url = getPlusCheckoutURL({ url: DEFAULT_URL, ...params });
  return url.toString().replace(url.origin, "");
}

export function parsePlusCheckoutURL(url: string | URL) {
  const nextUrl = new URL(url, DEFAULT_URL);
  const [, , , maybeStep, maybeType] = nextUrl.pathname.split("/");
  const parsedStep = PlusCheckoutStepSchema.safeParse(maybeStep);
  const parsedType = PlusTypeSchema.safeParse(maybeType);
  const step = parsedStep.success ? parsedStep.data : undefined;
  const type = parsedType.success ? parsedType.data : undefined;
  return { step, type };
}
