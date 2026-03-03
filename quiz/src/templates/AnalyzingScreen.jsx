import { useState, useEffect, useCallback } from 'react'
import { interpolate } from '../engine/computeVars'

function ChecklistItem({ label, done }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${done ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-500
        ${done ? 'bg-green' : 'border-2 border-grey'}`}>
        {done && <span className="text-bright text-small font-bold">✓</span>}
      </div>
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
    <div className="flex flex-col items-center gap-6 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="w-full animate-in">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start cursor-pointer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>
      <div className="flex-1" />

      <div className="animate-in">
        <p className="text-title font-title leading-[1.1] tracking-tight text-dark text-center">
          {interpolate(screen.title, ctx)}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full py-2 animate-in delay-1">
        {items.map((item, i) => (
          <ChecklistItem
            key={i}
            label={interpolate(item, ctx)}
            done={i < doneCount}
          />
        ))}
      </div>

      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden animate-in delay-2">
        <div
          className="h-full bg-dark rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1" />
    </div>
  )
}
