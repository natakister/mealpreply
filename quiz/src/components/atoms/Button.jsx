export default function Button({ label, onClick, className = '' }) {
  const hasArrow = label.includes('→')
  const text = hasArrow ? label.replace(' →', '').replace('→', '') : label

  return (
    <button
      onClick={onClick}
      className={`w-full h-[60px] rounded-full bg-dark text-beige font-sans text-cta font-normal
        flex items-center justify-center cursor-pointer
        hover:opacity-90 active:scale-[0.98] transition-all ${className}`}
    >
      {text}
      {hasArrow && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      )}
    </button>
  )
}
