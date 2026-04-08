import { useEffect, useState } from 'react'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'

function StatVariant({ screen, ctx }) {
  return (
    <>
      {/* Illustration — Cherries. Allowed to overflow above the screen like in the design. */}
      <div className="w-full flex items-center justify-center animate-in -mt-10">
        {screen.illustration ? (
          <img src={assetUrl(screen.illustration)} alt="" className="h-[260px] object-contain" />
        ) : (
          <div className="w-48 h-48 rounded-2xl bg-white/10 flex items-center justify-center">
            <span className="text-bright/40 text-small">illustration</span>
          </div>
        )}
      </div>

      {screen.statSubtitle && (
        <p className="text-body text-bright/80 text-center animate-in delay-1">
          ( {interpolate(screen.statSubtitle, ctx)} )
        </p>
      )}

      <div className="animate-in delay-2 flex flex-col items-center gap-5 w-full">
        <p className="font-title text-[60px] leading-[0.88] tracking-tight text-bright text-center">
          {interpolate(screen.stat, ctx)}
        </p>
        <p className="text-cta text-bright text-center leading-[1.3]">
          {interpolate(screen.statText, ctx)}
        </p>
      </div>
    </>
  )
}

function BridgeVariant({ screen, ctx }) {
  let body = ''
  if (screen.dynamicText) {
    const key = screen.dynamicText.key
    const val = ctx[key]
    body = screen.dynamicText.cases?.[val] ?? screen.dynamicText.default ?? ''
  }

  return (
    <>
      {/* Icon — AppleIcon or LoopIcon */}
      <div className="animate-in">
        {screen.icon ? (
          <img src={assetUrl(screen.icon)} alt="" className="w-[136px] h-[129px] object-contain mx-auto" />
        ) : (
          <div className="w-[136px] h-[129px] rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
            <span className="text-bright/40 text-small">icon</span>
          </div>
        )}
      </div>

      <div className="animate-in delay-1 flex flex-col gap-5 w-full">
        <h1 className="font-title text-[60px] leading-[0.88] text-bright">
          {interpolate(screen.title, ctx)}
        </h1>
        {body && (
          <p className="text-cta text-bright leading-[1.3]">
            {interpolate(body, ctx)}
          </p>
        )}
      </div>

      {/* Dietary chips — shown when screen has chips data */}
      {screen.chips && (
        <div className="flex flex-wrap gap-2 animate-in delay-2">
          {screen.chips.map((chip, i) => (
            <span key={i} className="bg-white/15 text-bright text-body rounded-full px-4 py-1.5 border border-white/20">
              {interpolate(chip, ctx)}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

function ProgressVariant({ screen, ctx }) {
  const rows = screen.summaryRows || []
  const targetPct = 78
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    // Delay so the card animates in first, then the bar fills
    const t = setTimeout(() => setProgress(targetPct), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <>
      <div className="animate-in delay-1">
        <p className="font-title text-[60px] leading-[0.88] tracking-tight text-dark text-center">
          {interpolate(screen.title, ctx)}
        </p>
      </div>

      {/* Summary in white card */}
      <div className="animate-in delay-2 bg-bright rounded-xl p-5 w-full">
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-cta text-grey">{interpolate(row.label, ctx)} →</span>
              <span className="text-cta text-dark">{interpolate(row.value, ctx)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-violett rounded-full transition-all duration-1200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <img src={assetUrl('/AppleIcon.png')} alt="" className="w-6 h-6 shrink-0 object-contain" />
        </div>
      </div>

      <div className="flex-1" />
    </>
  )
}

export default function InterstitialScreen({ screen, step, totalSteps, ctx = {}, onNext, onBack }) {
  const variant = screen.variant || 'stat'
  const isDark = screen.theme === 'dark'
  const isImageBg = screen.theme === 'image'

  const wrapperClasses = [
    'flex flex-col items-center gap-6 min-h-dvh px-5 pt-4 pb-28',
    isDark ? 'screen-dark' : '',
    isImageBg ? 'screen-image-bg pt-32' : '',
    !isDark && !isImageBg ? 'bg-bright' : '',
  ].filter(Boolean).join(' ')

  const backArrowColor = isDark ? 'text-bright' : 'text-dark'
  const ctaFooterBg = isDark
    ? 'bg-violett'
    : isImageBg
      ? ''
      : 'bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent'

  return (
    <div
      className={wrapperClasses}
      style={isImageBg && screen.bgImage ? { backgroundImage: `url(${assetUrl(screen.bgImage)})` } : undefined}
    >
      {/* Back arrow — absolute on image-bg, normal flow otherwise */}
      {isImageBg ? (
        <button onClick={onBack} className={`fixed top-10 left-5 z-10 w-10 h-10 flex items-center justify-start cursor-pointer ${backArrowColor}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      ) : (
        <div className="w-full animate-in">
          <button onClick={onBack} className={`w-10 h-10 flex items-center justify-start cursor-pointer ${backArrowColor}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </div>
      )}

      {variant === 'stat' && <StatVariant screen={screen} ctx={ctx} />}
      {variant === 'bridge' && <BridgeVariant screen={screen} ctx={ctx} />}
      {variant === 'progress' && <ProgressVariant screen={screen} ctx={ctx} />}

      {/* Fixed CTA footer: solid violet on dark, gradient fade on light/image */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-2 ${ctaFooterBg}`}>
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta || 'Continue →'} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
