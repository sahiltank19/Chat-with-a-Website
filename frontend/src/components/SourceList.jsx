/**
 * SourceList — deduplicated list of source pages cited in an AI answer.
 * Props:
 *   sources  {Array<{ url: string, title: string }>}
 */
function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  // Deduplicate by URL, keeping the first occurrence
  const seen  = new Set();
  const unique = sources.filter(({ url }) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  return (
    <div className="source-list" aria-label="Sources">
      <p className="source-list__label">📎 Sources</p>

      <ul className="source-list__items">
        {unique.map(({ url, title }, i) => (
          <li key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title && title !== url ? title : url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SourceList;
