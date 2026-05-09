export function sendAPIError(res, statusCode, message, details = {}) {
  console.error(statusCode, message, details);
  return res.status(statusCode).json({
    error: message,
    ...details,
  });
}

export function httpBadRequest(res, message, details = {}) {
  sendAPIError(res, 400, message, details);
}

export function httpUnauthorized(res, message = "Unauthorized", details = {}) {
  sendAPIError(res, 401, message, details);
}

export function httpForbidden(res, message = "Forbidden", details = {}) {
  sendAPIError(res, 403, message, details);
}

export function httpNotFound(res, message = "Not Found", details = {}) {
  sendAPIError(res, 404, message, details);
}

export function httpMethodNotAllowed(
  res,
  message = "Method Not Allowed",
  details = {},
) {
  sendAPIError(res, 405, message, details);
}

export function httpConflict(res, message = "Conflict", details = {}) {
  sendAPIError(res, 409, message, details);
}

export function httpUnprocessableEntity(
  res,
  message = "Unprocessable Entity",
  details = {},
) {
  sendAPIError(res, 422, message, details);
}

export function httpTooManyRequests(
  res,
  message = "Too Many Requests",
  details = {},
) {
  sendAPIError(res, 429, message, details);
}

export function httpInternalServerError(
  res,
  message = "Internal Server Error",
  details = {},
) {
  sendAPIError(res, 500, message, details);
}

export function httpNotImplemented(
  res,
  message = "Not Implemented",
  details = {},
) {
  sendAPIError(res, 501, message, details);
}

export function httpBadGateway(res, message = "Bad Gateway", details = {}) {
  sendAPIError(res, 502, message, details);
}

export function httpServiceUnavailable(
  res,
  message = "Service Unavailable",
  details = {},
) {
  sendAPIError(res, 503, message, details);
}

export function httpGatewayTimeout(
  res,
  message = "Gateway Timeout",
  details = {},
) {
  sendAPIError(res, 504, message, details);
}
