export default function TextInput({ value, placeholder, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-14 px-4 rounded-xl bg-bright border-2 border-border text-body text-dark placeholder:text-grey font-normal outline-none focus:border-violett transition-colors"
    />
  )
}
