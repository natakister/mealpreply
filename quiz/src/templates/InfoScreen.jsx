import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'
import { CalendarCheck, Coins, Clock, MoreHorizontal, Minus, Plus, Eye } from 'lucide-react'

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
      {/* Hero image — overflows above the viewport top */}
      {screen.heroImage && (
        <div className="w-full flex justify-center animate-in -mt-24 -mb-12">
          <img
            src={assetUrl(screen.heroImage)}
            alt=""
            className="max-h-[324px] w-auto object-contain"
          />
        </div>
      )}

      <div className="animate-in delay-1">
        <h1 className="font-title text-title leading-[1.1] tracking-tight text-dark">
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
              <p className="mb-2">
                <span
                  className="text-cta font-bold text-dark highlight-sweep"
                  style={{ animationDelay: `${600 + i * 250}ms` }}
                >
                  {card.label}
                </span>
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
          const labelText = interpolate(stat.label, ctx)
          // Split label into first word (dark) and rest (grey), e.g. "saved per week"
          const [firstLine, ...restWords] = labelText.split(' ')
          const secondLine = restWords.join(' ')
          return (
          <div key={i} className="flex-1 bg-bright rounded-xl py-4 px-4 flex flex-col items-center gap-2">
            <div className="w-11 h-11 flex items-center justify-center">
              {IconComponent && <IconComponent size={44} className={`${colorMap[stat.color] || 'text-violett'}`} strokeWidth={1.5} />}
            </div>
            <span className={`font-title text-[52px] leading-[1] ${colorMap[stat.color] || 'text-violett'}`}>
              {interpolate(stat.value, ctx)}
            </span>
            <div className="flex flex-col items-center">
              <span
                className="text-cta text-dark highlight-sweep"
                style={{ animationDelay: `${800 + i * 250}ms` }}
              >
                {firstLine}
              </span>
              {secondLine && <span className="text-cta text-grey">{secondLine}</span>}
            </div>
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

      {/* Highlight card — green with banana clipped at the waist, flush bottom-left */}
      {screen.highlightCard && (
        <div className="animate-in delay-2 flex items-stretch gap-3 bg-green rounded-2xl pr-4 w-full overflow-hidden">
          <div className="w-[120px] shrink-0 relative overflow-hidden self-stretch">
            {screen.highlightCard.image && (
              <img
                src={assetUrl(screen.highlightCard.image)}
                alt=""
                className="absolute left-1/2 -translate-x-1/2 top-2 h-[180px] max-w-none object-contain"
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 py-4 justify-center">
            {screen.highlightCard.lines.map((line, i) => (
              <p
                key={i}
                className="text-body font-semibold text-dark leading-tight animate-in"
                style={{ animationDelay: `${300 + i * 140}ms` }}
              >
                {interpolate(line, ctx)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Recipe list — single white card, thick black dividers only between rows */}
      <div className="bg-bright rounded-2xl w-full overflow-hidden animate-in delay-3">
        {recipes.map((recipe, i) => {
          const servings = recipe.servings ?? ctx.totalPeople ?? 4
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 ${i > 0 ? 'border-t-2 border-dark' : ''}`}
            >
              {recipe.image ? (
                <img src={assetUrl(recipe.image)} alt="" className="w-20 h-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 shrink-0 rounded-xl bg-border/30 flex items-center justify-center">
                  <span className="text-micro text-grey">photo</span>
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <span className="text-body font-bold text-dark leading-tight line-clamp-2">
                  {interpolate(recipe.name, ctx)}
                </span>
                <div className="flex items-center gap-1.5 text-dark">
                  <Clock size={14} strokeWidth={2.2} />
                  <span className="text-small font-medium">{interpolate(recipe.time, ctx)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="inline-flex items-center gap-1 bg-bright rounded-full border-2 border-dark pl-1 pr-1 py-0.5">
                    <button type="button" className="w-6 h-6 rounded-full flex items-center justify-center text-dark" aria-label="decrease">
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-small font-bold text-dark tabular-nums w-4 text-center">{servings}</span>
                    <button type="button" className="w-6 h-6 rounded-full flex items-center justify-center text-dark" aria-label="increase">
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-7 h-7 flex items-center justify-center text-dark" aria-label="view">
                      <Eye size={18} strokeWidth={2} />
                    </button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center text-dark" aria-label="more">
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default function InfoScreen({ screen, ctx = {}, onNext, onBack }) {
  const variant = screen.variant || 'insight'
  const isDark = screen.theme === 'dark'
  const isImageBg = screen.theme === 'image'

  const wrapperClasses = [
    'flex flex-col gap-4 min-h-dvh px-5 pt-4',
    variant === 'value_demo' ? 'pb-12' : 'pb-28',
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
      ? ''
      : 'bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent'

  return (
    <div
      className={wrapperClasses}
      style={isImageBg && screen.bgImage ? { backgroundImage: `url(${assetUrl(screen.bgImage)})` } : undefined}
    >
      <div className="animate-in">
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-start cursor-pointer ${arrowColor}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      <div className={`flex flex-col gap-4 ${isDark ? 'mt-6' : ''}`}>
        {variant === 'insight' && <InsightVariant screen={screen} ctx={ctx} />}
        {variant === 'solution' && <SolutionVariant screen={screen} ctx={ctx} />}
        {variant === 'value_demo' && <ValueDemoVariant screen={screen} ctx={ctx} />}
      </div>

      <div className="flex-1" />

      {/* Soft violet-to-transparent fade behind the CTA for value_demo */}
      {variant === 'value_demo' && (
        <div className="fixed bottom-0 left-0 right-0 h-48 z-10 bg-gradient-to-t from-violett via-violett/85 to-transparent pointer-events-none" />
      )}

      {/* Fixed CTA footer: solid violet on dark, gradient fade on light/image */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-2 ${ctaFooterBg}`}>
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta || 'Continue →'} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
