export default function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 rounded-sm bg-border">
      <div
        className="h-full rounded-sm bg-dark transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
