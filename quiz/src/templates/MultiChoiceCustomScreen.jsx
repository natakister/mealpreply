import ProgressHeader from '../components/molecules/ProgressHeader'
import SectionHeader from '../components/molecules/SectionHeader'
import OptionMulti from '../components/atoms/OptionMulti'
import TextInput from '../components/atoms/TextInput'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'

export default function MultiChoiceCustomScreen({ screen, step, totalSteps, answer, answers = {}, ctx = {}, onToggleMulti, onSelect, onNext, onBack }) {
  const selected = answer || []
  const customValue = answers[screen.customField] || ''

  return (
    <div className="flex flex-col gap-6 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="animate-in">
        <ProgressHeader step={step} totalSteps={totalSteps} onBack={onBack} />
      </div>

      <div className="animate-in delay-1">
        <SectionHeader title={interpolate(screen.title, ctx)} subtitle={interpolate(screen.subtitle, ctx)} />
      </div>

      <div className="flex flex-col gap-3">
        {screen.options.map((option, i) => (
          <div key={option.id} className={`animate-in delay-${Math.min(i + 2, 5)}`}>
            <OptionMulti
              label={option.text}
              selected={selected.includes(option.id)}
              onClick={() => onToggleMulti(screen.field, option.id, screen.exclusiveOptions || [])}
            />
          </div>
        ))}

        <div className={`animate-in delay-${Math.min(screen.options.length + 2, 5)}`}>
          <TextInput
            value={customValue}
            placeholder={screen.customPlaceholder || 'Other...'}
            onChange={(val) => onSelect(screen.customField, val)}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto">
          <Button
            label={screen.cta}
            onClick={onNext}
            className={selected.length > 0 || customValue ? 'opacity-100' : 'opacity-40 pointer-events-none'}
          />
        </div>
      </div>
    </div>
  )
}
