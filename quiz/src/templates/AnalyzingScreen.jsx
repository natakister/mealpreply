import { useState, useEffect, useCallback } from 'react'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'

function ChecklistItem({ label, done }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${done ? 'opacity-100' : 'opacity-40'}`}>
      <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center transition-colors duration-500
        ${done ? 'bg-violett' : ''}`}>
        {done && <span className="text-bright text-body font-semibold font-['Lacquer']">V</span>}
      </span>
      <span className={`text-body transition-colors duration-500 ${done ? 'text-dark font-medium' : 'text-grey'}`}>
        {label}
      </span>
    </div>
  )
}

export default function AnalyzingScreen({ screen, ctx = {}, onNext, onBack }) {
  const items = screen.checklist || []
  const [doneCount, setDoneCount] = useState(0)
  const delay = screen.itemDelay || 1200
  const isDark = screen.theme === 'image'

  const advance = useCallback(() => {
    setDoneCount(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (doneCount < items.length) {
      const timer = setTimeout(advance, delay)
      return () => clearTimeout(timer)
    }
    // All done — auto-advance after a brief pause
    const timer = setTimeout(onNext, 800)
    return () => clearTimeout(timer)
  }, [doneCount, items.length, delay, advance, onNext])

  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0

  return (
    <div
      className={`flex flex-col items-center gap-6 min-h-dvh px-5 pt-4 pb-28 ${isDark ? 'screen-image-bg' : 'bg-bright'}`}
      style={isDark && screen.bgImage ? { backgroundImage: `url(${assetUrl(screen.bgImage)})` } : undefined}
    >
      <div className="w-full animate-in">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start cursor-pointer text-dark">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>
      <div className="flex-1" />

      <div className="animate-in">
        <p className="font-title text-[60px] leading-[0.88] tracking-tight text-center text-dark">
          {interpolate(screen.title, ctx)}
        </p>
      </div>

      {/* Checklist in white card */}
      <div className="bg-bright rounded-xl p-5 w-full animate-in delay-1">
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <ChecklistItem
              key={i}
              label={interpolate(item, ctx)}
              done={i < doneCount}
            />
          ))}
        </div>
        <div className="mt-10 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-violett rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-body text-violett font-semibold tabular-nums shrink-0 w-10 text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  )
}
