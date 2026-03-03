export default function parseHighlight(text) {
  if (!text || !text.includes('==')) return text
  const parts = text.split(/==(.*?)==/)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <mark key={i} className="highlight">{part}</mark>
      : part
  )
}
