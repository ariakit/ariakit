import { type PlusType, PlusTypeSchema } from "./schemas.ts";

export interface GetPlusCheckoutPathParams {
  url: string | URL;
  type?: PlusType;
  step?: string;
}

export function getPlusCheckoutPath({
  url,
  step,
  type,
}: GetPlusCheckoutPathParams) {
  const { step: _step = "sign-up", type: _type = "personal" } =
    parsePlusCheckoutPath(url);
  type = type ?? _type;
  step = step ?? _step;
  const nextUrl = new URL(`/plus/checkout/${step}/${type}`, url);
  const redirectUrl = getRedirectUrl(url);
  if (redirectUrl) {
    nextUrl.searchParams.set("redirect_url", encodeURIComponent(redirectUrl));
  }
  return nextUrl.toString().replace(nextUrl.origin, "");
}

export function getRedirectUrl(url: string | URL) {
  url = new URL(url);
  const redirectUrl = url.searchParams.get("redirect_url");
  if (!redirectUrl) return null;
  return decodeURIComponent(redirectUrl);
}

export function parsePlusCheckoutPath(url: string | URL) {
  const [, , , step, maybeType] = new URL(url).pathname.split("/");
  const parsed = PlusTypeSchema.safeParse(maybeType);
  const type = parsed.success ? parsed.data : undefined;
  return { step, type };
}
