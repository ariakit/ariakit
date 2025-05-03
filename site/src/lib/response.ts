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
export const notFound = createResponse("Not found", { status: 404 });
export const internalServerError = createResponse("Internal server error", {
  status: 500,
});
