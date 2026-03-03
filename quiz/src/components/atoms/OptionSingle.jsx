import parseHighlight from '../../utils/parseHighlight'

export default function OptionSingle({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-5 p-5
        rounded-xl bg-bright border-2 cursor-pointer transition-colors duration-200
        ${selected ? 'border-violett animate-select' : 'border-dark'}`}
    >
      <span className="text-body font-normal text-dark text-left">{parseHighlight(label)}</span>
      <span
        className={`w-6 h-6 rounded-full shrink-0 transition-colors duration-200
          ${selected ? 'bg-violett' : 'border-2 border-dark'}`}
      />
    </button>
  )
}
