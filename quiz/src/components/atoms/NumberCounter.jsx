export default function NumberCounter({ label, value, min = 0, max = 10, onChange }) {
  return (
    <div className="w-full flex items-center justify-between px-5 h-[72px] rounded-xl bg-bright border-2 border-dark">
      <span className="text-body font-medium text-dark">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => value > min && onChange(value - 1)}
          className={`w-10 h-10 rounded-full bg-beige flex items-center justify-center cursor-pointer transition-opacity ${value <= min ? 'opacity-30' : ''}`}
        >
          <span className="text-lg font-medium text-dark leading-none">−</span>
        </button>
        <span className="text-lg font-semibold text-dark w-8 text-center">{value}</span>
        <button
          onClick={() => value < max && onChange(value + 1)}
          className={`w-10 h-10 rounded-full bg-dark flex items-center justify-center cursor-pointer transition-opacity ${value >= max ? 'opacity-30' : ''}`}
        >
          <span className="text-lg font-medium text-bright leading-none">+</span>
        </button>
      </div>
    </div>
  )
}
