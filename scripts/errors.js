/**
 * Error with an HTTP status and a stable, machine-readable code (see API.md).
 */
class ApiError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

const validationError = (message) => new ApiError(400, 'VALIDATION_ERROR', message);
const notFound = (message) => new ApiError(404, 'NOT_FOUND', message);

/**
 * Wrap an async route handler so rejected promises reach the error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ApiError, validationError, notFound, asyncHandler };
