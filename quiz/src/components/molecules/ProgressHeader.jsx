import Logo from '../atoms/Logo'
import ProgressBar from '../atoms/ProgressBar'

export default function ProgressHeader({ step, totalSteps, onBack }) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="flex flex-col gap-4 w-full pb-[30px]">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-start cursor-pointer"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <Logo />
        <span className="text-cta font-medium text-dark w-[50px] text-right">
          {step}/{totalSteps}
        </span>
      </div>
      <ProgressBar progress={progress} />
    </div>
  )
}
