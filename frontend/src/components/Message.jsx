/**
 * Message — a single chat bubble.
 * Props:
 *   role     {"user"|"assistant"}
 *   content  {string}
 */
function Message({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar" aria-hidden="true">
        {isUser ? "You" : "AI"}
      </div>

      <div className="message__bubble">
        {/* Preserve line-breaks from multi-line answers */}
        {content.split("\n").map((line, i) =>
          line ? <p key={i}>{line}</p> : <br key={i} />
        )}
      </div>
    </div>
  );
}

export default Message;
