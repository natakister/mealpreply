import { assetUrl } from '../../utils/assetUrl'

export default function Logo() {
  return (
    <img
      src={assetUrl('/logo.png')}
      alt="MealPreply"
      className="w-9 h-9 rounded-lg object-cover"
    />
  )
}
