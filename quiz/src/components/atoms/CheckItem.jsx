import parseHighlight from '../../utils/parseHighlight'

export default function CheckItem({ text, light = false }) {
  const color = light ? 'text-bright' : 'text-dark'
  return (
    <div className="flex gap-1">
      <span className={`text-cta font-normal font-['Lacquer'] w-5 shrink-0 ${light ? color : 'text-violett'}`}>*</span>
      <span className={`text-body font-normal ${color}`}>{parseHighlight(text)}</span>
    </div>
  )
}
