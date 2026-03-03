import parseHighlight from '../../utils/parseHighlight'

export default function SectionHeader({ title, subtitle, subtitleClassName = 'text-body' }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <h1 className="text-title font-title text-dark text-center tracking-tight leading-[1.1]">
        {parseHighlight(title)}
      </h1>
      {subtitle && (
        <p className={`${subtitleClassName} font-normal text-dark text-center leading-[1.2]`}>
          {parseHighlight(subtitle)}
        </p>
      )}
    </div>
  )
}
