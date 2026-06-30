/**
 * Loader — animated spinner with an optional status message.
 * Props:
 *   message  {string}  Text shown below the spinner. Default: "Loading…"
 *   size     {"sm"|"md"|"lg"}  Spinner size. Default: "md"
 */
function Loader({ message = "Loading…", size = "md" }) {
  return (
    <div className={`loader loader--${size}`} role="status" aria-label={message}>
      <span className="loader__spinner" aria-hidden="true" />
      {message && <p className="loader__message">{message}</p>}
    </div>
  );
}

export default Loader;
