import { assetUrl } from '../../utils/assetUrl'

export default function LogoText() {
  return (
    <img
      src={assetUrl('/logo_text.png')}
      alt="MealPreply"
      className="h-8 object-contain"
    />
  )
}
