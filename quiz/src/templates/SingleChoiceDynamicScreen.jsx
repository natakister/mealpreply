import { useMemo } from 'react'
import ProgressHeader from '../components/molecules/ProgressHeader'
import SectionHeader from '../components/molecules/SectionHeader'
import OptionSingle from '../components/atoms/OptionSingle'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'

function buildOptions(screen, ctx) {
  const seen = new Set()
  const result = []

  for (const source of screen.optionSources || []) {
    const answerValue = ctx[source.key]
    const option = source.options?.[answerValue]
    if (option && !seen.has(option.id)) {
      seen.add(option.id)
      result.push(option)
    }
  }

  // Fill remaining slots from defaults (up to 4)
  for (const option of screen.defaultOptions || []) {
    if (result.length >= 4) break
    if (!seen.has(option.id)) {
      seen.add(option.id)
      result.push(option)
    }
  }

  return result
}

export default function SingleChoiceDynamicScreen({ screen, step, totalSteps, answer, ctx = {}, onSelect, onNext, onBack }) {
  const options = useMemo(() => buildOptions(screen, ctx), [screen, ctx])

  return (
    <div className="flex flex-col gap-6 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="animate-in">
        <ProgressHeader step={step} totalSteps={totalSteps} onBack={onBack} />
      </div>

      <div className="animate-in delay-1">
        <SectionHeader title={interpolate(screen.title, ctx)} subtitle={interpolate(screen.subtitle, ctx)} />
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option, i) => (
          <div key={option.id} className={`animate-in delay-${Math.min(i + 2, 5)}`}>
            <OptionSingle
              label={option.text}
              selected={answer === option.id}
              onClick={() => onSelect(screen.field, option.id)}
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto">
          <Button
            label={screen.cta}
            onClick={onNext}
            className={answer ? 'opacity-100' : 'opacity-40 pointer-events-none'}
          />
        </div>
      </div>
    </div>
  )
}
