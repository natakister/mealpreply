import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'

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
      <div className="animate-in delay-1">
        <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark">
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

      {screen.socialProofBadge && (
        <div className="flex items-center justify-center gap-2 py-4 animate-in delay-3">
          <img src={assetUrl('/laurel_l.png')} alt="" className="w-6 h-6 object-contain" />
          <div className="text-center">
            <p className="text-small font-bold tracking-wider uppercase text-dark">{screen.socialProofBadge.title}</p>
            <p className="text-small text-grey">{screen.socialProofBadge.text}</p>
          </div>
          <img src={assetUrl('/laurel_r.png')} alt="" className="w-6 h-6 object-contain" />
        </div>
      )}
    </>
  )
}

function SolutionVariant({ screen, ctx }) {
  const headline = resolveDynamic(screen.dynamicTitle, ctx)
  const benefit = resolveDynamic(screen.dynamicBenefit, ctx)
  const steps = screen.steps || []
  const stats = screen.stats || []

  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark">
          {headline}
        </h1>
      </div>

      <div className="animate-in delay-2 flex items-center justify-evenly w-full">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-0">
            {i > 0 && <span className="text-body text-grey mx-1">&rarr;</span>}
            <div className="flex flex-col items-center gap-1 px-2 py-3">
              <span className="text-lg font-bold text-violett">{i + 1}</span>
              <span className="text-small font-semibold text-dark">{step}</span>
            </div>
          </div>
        ))}
      </div>

      {benefit && (
        <div className="animate-in delay-3 bg-beige rounded-xl p-4">
          <p className="text-body text-dark leading-[1.4]">{benefit}</p>
        </div>
      )}

      <div className="animate-in delay-4 flex gap-3 w-full">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 bg-beige rounded-xl py-5 px-4 flex flex-col items-center gap-1">
            <span className={`text-lg font-bold ${colorMap[stat.color] || 'text-violett'}`}>
              {interpolate(stat.value, ctx)}
            </span>
            <span className="text-small text-grey">{interpolate(stat.label, ctx)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ValueDemoVariant({ screen, ctx }) {
  const recipes = screen.recipes || []
  const blurred = screen.blurredItems || []

  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      <div className="animate-in delay-2">
        <span className="inline-block bg-beige rounded-full px-5 py-2 text-body font-semibold text-dark">
          {interpolate(screen.costBadge, ctx)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {recipes.map((recipe, i) => (
          <div key={i} className={`animate-in delay-${Math.min(i + 3, 5)} flex items-center justify-between bg-beige rounded-xl px-4 py-4`}>
            <span className="text-body font-semibold text-dark">{interpolate(recipe.name, ctx)}</span>
            <span className="bg-violett text-bright text-small rounded-full px-3 py-1 whitespace-nowrap">{interpolate(recipe.time, ctx)}</span>
          </div>
        ))}
      </div>

      <div className="animate-in delay-5 flex flex-col gap-1.5 opacity-30 px-2">
        {blurred.map((item, i) => (
          <p key={i} className="text-body text-dark">{item}</p>
        ))}
      </div>

      {screen.socialProofBadge && (
        <div className="flex items-center justify-center gap-2 py-4 animate-in delay-3">
          <img src={assetUrl('/laurel_l.png')} alt="" className="w-6 h-6 object-contain" />
          <div className="text-center">
            <p className="text-small font-bold tracking-wider uppercase text-dark">{screen.socialProofBadge.title}</p>
            <p className="text-small text-grey">{screen.socialProofBadge.text}</p>
          </div>
          <img src={assetUrl('/laurel_r.png')} alt="" className="w-6 h-6 object-contain" />
        </div>
      )}
    </>
  )
}

export default function InfoScreen({ screen, ctx = {}, onNext, onBack }) {
  const variant = screen.variant || 'insight'

  return (
    <div className="flex flex-col gap-4 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="animate-in">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start cursor-pointer">
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

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta || 'Continue →'} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
