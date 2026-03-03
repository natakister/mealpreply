import { assetUrl } from '../../utils/assetUrl'

export default function SocialProofBadge({ title, text }) {
  return (
    <div className="flex items-center justify-center gap-0.5 pb-2.5">
      <img src={assetUrl('/laurel_l.png')} alt="" className="w-[18px] h-[60px] object-contain" />
      <div className="flex flex-col items-center gap-0.5" style={{ width: 179 }}>
        <span className="text-small font-bold text-dark uppercase" style={{ letterSpacing: 1 }}>{title}</span>
        <span className="text-small text-dark text-center leading-[1.1]">{text}</span>
      </div>
      <img src={assetUrl('/laurel_r.png')} alt="" className="w-[18px] h-[60px] object-contain" />
    </div>
  )
}
