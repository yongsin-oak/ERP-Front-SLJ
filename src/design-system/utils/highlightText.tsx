/** Wraps the first occurrence of `query` in `text` with a yellow <mark>. */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase().trim();
  const idx = lower.indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-warning-bg px-px text-inherit">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
