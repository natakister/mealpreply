import ProgressHeader from '../components/molecules/ProgressHeader'
import SectionHeader from '../components/molecules/SectionHeader'
import NumberCounter from '../components/atoms/NumberCounter'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'

export default function NumberInputScreen({ screen, step, totalSteps, answers = {}, ctx = {}, onSelect, onNext, onBack }) {
  return (
    <div className="flex flex-col gap-6 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="animate-in">
        <ProgressHeader step={step} totalSteps={totalSteps} onBack={onBack} />
      </div>

      <div className="animate-in delay-1">
        <SectionHeader title={interpolate(screen.title, ctx)} subtitle={interpolate(screen.subtitle, ctx)} />
      </div>

      <div className="flex flex-col gap-3">
        {screen.fields.map((field, i) => (
          <div key={field.id} className={`animate-in delay-${Math.min(i + 2, 5)}`}>
            <NumberCounter
              label={field.label}
              value={answers[field.id] ?? field.default ?? 0}
              min={field.min}
              max={field.max}
              onChange={(val) => onSelect(field.id, val)}
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto">
          <Button label={screen.cta} onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
