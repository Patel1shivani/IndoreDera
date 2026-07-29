/*
 * Ek hi error type poore app me. Route sirf `throw new ApiError(...)` karta hai
 * aur error middleware use client-friendly JSON me badal deta hai.
 *
 * Messages Hindi/Roman-Hindi me hain kyunki wo seedha UI par dikhte hain.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} message user ko dikhne wala message
   * @param {object} [details] field-wise validation errors etc.
   */
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "Pehle login karein.") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Iski permission nahi hai.") {
    return new ApiError(403, message);
  }
  static notFound(message = "Nahi mila.") {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  /** Plan/quota chahiye — HTTP 402 Payment Required. */
  static paymentRequired(message) {
    return new ApiError(402, message);
  }
}
