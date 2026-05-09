function sendAPIError(res, statusCode, message, details = {}) {
  console.error(statusCode, message, details);
  return res.status(statusCode).json({
    error: message,
    ...details,
  });
}

function httpBadRequest(res, message, details = {}) {
  sendAPIError(res, 400, message, details);
}

function httpUnauthorized(res, message = "Unauthorized", details = {}) {
  sendAPIError(res, 401, message, details);
}

function httpForbidden(res, message = "Forbidden", details = {}) {
  sendAPIError(res, 403, message, details);
}

function httpNotFound(res, message = "Not Found", details = {}) {
  sendAPIError(res, 404, message, details);
}

function httpMethodNotAllowed(
  res,
  message = "Method Not Allowed",
  details = {},
) {
  sendAPIError(res, 405, message, details);
}

function httpConflict(res, message = "Conflict", details = {}) {
  sendAPIError(res, 409, message, details);
}

function httpUnprocessableEntity(
  res,
  message = "Unprocessable Entity",
  details = {},
) {
  sendAPIError(res, 422, message, details);
}

function httpTooManyRequests(res, message = "Too Many Requests", details = {}) {
  sendAPIError(res, 429, message, details);
}

function httpInternalServerError(
  res,
  message = "Internal Server Error",
  details = {},
) {
  sendAPIError(res, 500, message, details);
}

function httpNotImplemented(res, message = "Not Implemented", details = {}) {
  sendAPIError(res, 501, message, details);
}

function httpBadGateway(res, message = "Bad Gateway", details = {}) {
  sendAPIError(res, 502, message, details);
}

function httpServiceUnavailable(
  res,
  message = "Service Unavailable",
  details = {},
) {
  sendAPIError(res, 503, message, details);
}

function httpGatewayTimeout(res, message = "Gateway Timeout", details = {}) {
  sendAPIError(res, 504, message, details);
}

module.exports = {
  sendAPIError,
  httpBadRequest,
  httpUnauthorized,
  httpForbidden,
  httpNotFound,
  httpMethodNotAllowed,
  httpConflict,
  httpUnprocessableEntity,
  httpTooManyRequests,
  httpInternalServerError,
  httpNotImplemented,
  httpBadGateway,
  httpServiceUnavailable,
  httpGatewayTimeout,
};
