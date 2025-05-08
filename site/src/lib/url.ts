import {
  type PlusCheckoutStep,
  PlusCheckoutStepSchema,
  type PlusType,
  PlusTypeSchema,
} from "./schemas.ts";

export interface GetPlusCheckoutPathParams {
  url: string | URL;
  type?: PlusType;
  step?: PlusCheckoutStep;
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
  const [, , , maybeStep, maybeType] = new URL(url).pathname.split("/");
  const parsedStep = PlusCheckoutStepSchema.safeParse(maybeStep);
  const parsedType = PlusTypeSchema.safeParse(maybeType);
  const step = parsedStep.success ? parsedStep.data : undefined;
  const type = parsedType.success ? parsedType.data : undefined;
  return { step, type };
}
