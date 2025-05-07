function createResponse(
  defaultBody?: BodyInit | null,
  defaultOptions?: ResponseInit,
) {
  return (body?: BodyInit | null, options?: ResponseInit) => {
    return new Response(body ?? defaultBody, { ...defaultOptions, ...options });
  };
}

export const ok = createResponse("OK", { status: 200 });
export const badRequest = createResponse("Bad request", { status: 400 });
export const unauthorized = createResponse("Unauthorized", { status: 401 });
export const forbidden = createResponse("Forbidden", { status: 403 });
export const notFound = createResponse("Not found", { status: 404 });
export const internalServerError = createResponse("Internal server error", {
  status: 500,
});
