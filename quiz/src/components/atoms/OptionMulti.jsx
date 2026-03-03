export default function OptionMulti({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-5 p-5
        rounded-xl bg-bright border-2 cursor-pointer transition-colors
        ${selected ? 'border-violett' : 'border-dark'}`}
    >
      <span className="text-body font-normal text-dark text-left">{label}</span>
      <span
        className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center transition-colors
          ${selected ? 'bg-violett' : 'border-2 border-dark'}`}
      >
        {selected && <span className="text-bright text-body font-semibold font-['Lacquer']">X</span>}
      </span>
    </button>
  )
}
