import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'
import { CalendarCheck, Coins } from 'lucide-react'

const statIconMap = {
  violett: CalendarCheck,
  green: Coins,
}

function resolveDynamic(dynamicDef, ctx) {
  if (!dynamicDef) return ''
  const val = ctx[dynamicDef.key]
  const raw = dynamicDef.cases?.[val] ?? dynamicDef.default ?? ''
  return interpolate(raw, ctx)
}

const colorMap = {
  orange: 'text-orange',
  pink: 'text-pink',
  violett: 'text-violett',
  green: 'text-green',
}

function InsightVariant({ screen, ctx }) {
  const cards = screen.cards || []
  return (
    <>
      {/* Hero image — family photo */}
      {screen.heroImage ? (
        <div className="w-full max-h-[220px] overflow-hidden rounded-2xl animate-in">
          <img src={assetUrl(screen.heroImage)} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full flex-1 max-h-[220px] rounded-2xl bg-white/10 flex items-center justify-center animate-in">
          <span className="text-bright/40 text-small">image</span>
        </div>
      )}

      <div className="animate-in delay-1">
        <h1 className="font-title text-title leading-[1.1] tracking-tight text-bright">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((card, i) => {
          const body = resolveDynamic(card.dynamicText, ctx)
          if (card.condition) {
            const actual = card.condition.computed ? ctx[card.condition.field] : ctx[card.condition.field]
            if (card.condition.operator === '!==' && actual === card.condition.value) return null
            if (card.condition.operator === '===' && actual !== card.condition.value) return null
          }
          return (
            <div key={i} className={`animate-in delay-${Math.min(i + 2, 5)} border border-border rounded-xl bg-bright p-4`}>
              <p className={`text-small font-bold mb-1 ${colorMap[card.color] || 'text-grey'}`}>
                {card.label}
              </p>
              <p className="text-body text-dark leading-[1.4]">{body}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

function SolutionVariant({ screen, ctx }) {
  const headline = resolveDynamic(screen.dynamicTitle, ctx)
  const subtitle = screen.subtitle ? interpolate(screen.subtitle, ctx) : ''
  const stats = screen.stats || []

  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="font-title text-title leading-[1.1] tracking-tight text-bright">
          {headline}
        </h1>
      </div>

      {subtitle && (
        <p className="text-cta text-bright leading-[1.3] animate-in delay-2">
          {subtitle}
        </p>
      )}

      {/* Stat cards — time + money */}
      <div className="animate-in delay-3 flex gap-3 w-full">
        {stats.map((stat, i) => {
          const IconComponent = statIconMap[stat.color]
          return (
          <div key={i} className="flex-1 bg-bright rounded-xl py-4 px-4 flex flex-col items-center gap-2">
            <div className="w-11 h-11 flex items-center justify-center">
              {IconComponent && <IconComponent size={44} className={`${colorMap[stat.color] || 'text-violett'}`} strokeWidth={1.5} />}
            </div>
            <span className={`text-[40px] font-bold ${colorMap[stat.color] || 'text-violett'}`}>
              {interpolate(stat.value, ctx)}
            </span>
            <span className="text-cta text-grey text-center">{interpolate(stat.label, ctx)}</span>
          </div>
          )
        })}
      </div>
    </>
  )
}

function ValueDemoVariant({ screen, ctx }) {
  const recipes = screen.recipes || []

  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="font-title text-title leading-[1.1] tracking-tight text-bright">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      {/* Rating badge with laurels */}
      {screen.socialProofBadge && (
        <div className="flex items-center justify-start gap-2 animate-in delay-2 w-full">
          <img src={assetUrl('/laurel_l.png')} alt="" className="w-6 h-8 object-contain brightness-0 invert" />
          <div>
            <p className="text-body font-bold text-bright">{screen.socialProofBadge.title}</p>
            <p className="text-small text-bright">{screen.socialProofBadge.text}</p>
          </div>
          <img src={assetUrl('/laurel_r.png')} alt="" className="w-6 h-8 object-contain brightness-0 invert" />
        </div>
      )}

      {/* Highlight card — summary stats */}
      {screen.highlightCard && (
        <div className="animate-in delay-2 flex items-center gap-3 bg-bright rounded-xl p-3 w-full">
          <div className="w-[100px] h-[100px] shrink-0 rounded-[10px] bg-border/30 flex items-center justify-center overflow-hidden">
            {screen.highlightCard.image ? (
              <img src={assetUrl(screen.highlightCard.image)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-micro text-grey">photo</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            {screen.highlightCard.lines.map((line, i) => (
              <p key={i} className="text-small text-dark">{interpolate(line, ctx)}</p>
            ))}
          </div>
        </div>
      )}

      {/* Recipe cards — scroll naturally, no height limit */}
      <div className="flex flex-col gap-2 w-full">
        {recipes.map((recipe, i) => (
          <div key={i} className={`animate-in delay-${Math.min(i + 3, 5)} flex items-center gap-3 bg-bright rounded-xl px-3 py-3`}>
            {recipe.image ? (
              <img src={assetUrl(recipe.image)} alt="" className="w-[60px] h-[60px] shrink-0 rounded-[10px] object-cover" />
            ) : (
              <div className="w-[60px] h-[60px] shrink-0 rounded-[10px] bg-border/50 flex items-center justify-center">
                <span className="text-micro text-grey">photo</span>
              </div>
            )}
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-body font-semibold text-dark">{interpolate(recipe.name, ctx)}</span>
              <span className="text-small text-grey">( {interpolate(recipe.time, ctx)} )</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient fade at bottom — fixed position over recipe list */}
      <div className="w-[calc(100%+40px)] -mx-5 h-64 -mt-64 relative z-10 bg-gradient-to-t from-violett via-violett/70 to-transparent pointer-events-none" />
    </>
  )
}

export default function InfoScreen({ screen, ctx = {}, onNext, onBack }) {
  const variant = screen.variant || 'insight'
  const isDark = screen.theme === 'dark'
  const isImageBg = screen.theme === 'image'

  const wrapperClasses = [
    'flex flex-col gap-4 min-h-dvh px-5 pt-4 pb-28',
    isDark ? 'screen-dark' : '',
    isImageBg ? 'screen-image-bg' : '',
    !isDark && !isImageBg ? 'bg-bright' : '',
  ].filter(Boolean).join(' ')

  const backArrowColor = (isDark || isImageBg) ? 'text-dark' : 'text-dark'
  // Insight has image bg but dark back arrow per design
  const arrowColor = variant === 'insight' ? 'text-dark' : isDark ? 'text-bright' : 'text-dark'

  const ctaFooterBg = isDark
    ? 'bg-violett'
    : isImageBg
      ? 'bg-gradient-to-t from-[#FBFBFB]/95 via-[#FBFBFB]/80 to-transparent'
      : 'bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent'

  return (
    <div
      className={wrapperClasses}
      style={isImageBg && screen.bgImage ? { backgroundImage: `url(${screen.bgImage})` } : undefined}
    >
      <div className="animate-in">
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-start cursor-pointer ${arrowColor}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {variant === 'insight' && <InsightVariant screen={screen} ctx={ctx} />}
      {variant === 'solution' && <SolutionVariant screen={screen} ctx={ctx} />}
      {variant === 'value_demo' && <ValueDemoVariant screen={screen} ctx={ctx} />}

      <div className="flex-1" />

      {/* Fixed CTA footer: solid violet on dark, gradient fade on light/image */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-2 ${ctaFooterBg}`}>
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta || 'Continue →'} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
