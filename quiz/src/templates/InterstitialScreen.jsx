import SectionHeader from '../components/molecules/SectionHeader'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'

const colorMap = { orange: 'text-orange', pink: 'text-pink', violett: 'text-violett', green: 'text-green' }

function InfoCard({ card, delayMs }) {
  return (
    <div
      className="border border-border rounded-xl bg-bright p-4 w-full animate-in"
      style={{ animationDelay: delayMs != null ? `${delayMs}ms` : undefined }}
    >
      <p className={`text-small font-bold mb-1 ${colorMap[card.color] || 'text-violett'}`}>
        {card.label}
      </p>
      <p className="text-body text-dark leading-[1.4]">{card.body}</p>
    </div>
  )
}

function StatVariant({ screen, ctx }) {
  return (
    <>
      <div className="animate-in delay-1">
        <p className="text-title font-title leading-[1.1] tracking-tight text-dark text-center">
          {interpolate(screen.title, ctx)}
        </p>
      </div>
      <div className="animate-in delay-2 flex flex-col items-center gap-2">
        <p className="text-title font-sans leading-[1.1] tracking-tight text-violett text-center font-bold">
          {interpolate(screen.stat, ctx)}
        </p>
        <p className="text-body text-dark text-center leading-[1.3]">
          {interpolate(screen.statText, ctx)}
        </p>
      </div>
      {screen.infoCard && (
        <InfoCard card={screen.infoCard} delayMs={300} />
      )}
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
      <div className="animate-in delay-1">
        <SectionHeader
          title={interpolate(screen.title, ctx)}
          subtitle={interpolate(body, ctx)}
          subtitleClassName="text-cta"
        />
      </div>
      {screen.infoCards?.map((card, i) => (
        <InfoCard key={i} card={card} delayMs={(i + 1) * 150} />
      ))}
    </>
  )
}

function ProgressVariant({ screen, ctx }) {
  const rows = screen.summaryRows || []
  return (
    <>
      <div className="animate-in delay-1">
        <p className="text-title font-title leading-[1.1] tracking-tight text-dark text-center">
          {interpolate(screen.title, ctx)}
        </p>
      </div>
      <div className="animate-in delay-2 flex flex-col gap-4 w-full py-5">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-body text-grey">{interpolate(row.label, ctx)}</span>
            <span className="text-body text-dark font-semibold">{interpolate(row.value, ctx)}</span>
          </div>
        ))}
      </div>
      <div className="w-full animate-in delay-2">
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-violett rounded-full" style={{ width: '78%' }} />
        </div>
        {screen.progressMessage && (
          <p className="text-small text-grey text-center w-full mt-3">{screen.progressMessage}</p>
        )}
      </div>
    </>
  )
}

export default function InterstitialScreen({ screen, step, totalSteps, ctx = {}, onNext, onBack }) {
  const variant = screen.variant || 'stat'

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

      {variant === 'stat' && <StatVariant screen={screen} ctx={ctx} />}
      {variant === 'bridge' && <BridgeVariant screen={screen} ctx={ctx} />}
      {variant === 'progress' && <ProgressVariant screen={screen} ctx={ctx} />}

      <div className="flex-1" />

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta || 'Continue →'} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
