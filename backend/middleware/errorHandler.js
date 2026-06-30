/**
 * Centralised Express error-handling middleware.
 *
 * Must be registered LAST in app.js (after all routes).
 * Any route that calls next(error) or throws in an async handler
 * will end up here.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status  = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Handle Google Generative AI Errors Cleanly ──────────────────────
  const isGoogleAIError =
    err.name === "GoogleGenerativeAIFetchError" ||
    (message && (
      message.includes("GoogleGenerativeAI") ||
      message.includes("generativelanguage.googleapis.com") ||
      message.includes("QuotaExhaustedError")
    ));

  if (isGoogleAIError) {
    if (status === 429 || message.includes("429") || message.includes("quota") || message.includes("Quota")) {
      status = 429;
      // Extract suggested retry wait time if available in error message
      const match = message.match(/retry in ([\d.]+)s/i);
      const waitTime = match ? ` Please retry in ${Math.ceil(parseFloat(match[1]))} seconds.` : "";
      message = `Gemini API Rate Limit Exceeded (Free Tier limit reached).${waitTime}`;
    } else if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      status = 401;
      message = "Invalid GEMINI_API_KEY. Please verify your backend configuration.";
    } else {
      // General clean up: remove raw API URL and internal stack traces
      message = "The AI service encountered an issue. Please try your question again.";
    }
  }

  // Only log stack traces for unexpected server errors (real 500s)
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
  });
}

module.exports = errorHandler;
