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
  const nextUrl = new URL(url);
  nextUrl.pathname = `/plus/checkout/${step}/${type}`;
  return nextUrl.toString().replace(nextUrl.origin, "");
}

export function parsePlusCheckoutPath(url: string | URL) {
  const [, , , maybeStep, maybeType] = new URL(url).pathname.split("/");
  const parsedStep = PlusCheckoutStepSchema.safeParse(maybeStep);
  const parsedType = PlusTypeSchema.safeParse(maybeType);
  const step = parsedStep.success ? parsedStep.data : undefined;
  const type = parsedType.success ? parsedType.data : undefined;
  return { step, type };
}
