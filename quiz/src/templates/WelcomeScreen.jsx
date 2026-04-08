import LogoText from '../components/atoms/LogoText'
import SectionHeader from '../components/molecules/SectionHeader'
import CheckItem from '../components/atoms/CheckItem'
import SocialProofBadge from '../components/molecules/SocialProofBadge'
import Button from '../components/atoms/Button'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'

export default function WelcomeScreen({ screen, ctx = {}, onNext }) {
  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-36 bg-bright">
      <div className="flex justify-center animate-in">
        <LogoText />
      </div>

      <div className="animate-in delay-1">
        <SectionHeader title={interpolate(screen.title, ctx)} subtitle={interpolate(screen.subtitle, ctx)} subtitleClassName="text-cta" />
      </div>

      {/* Hero: two photos with stickers — pre-composed single image */}
      <div className="-mx-5 animate-in delay-2">
        <img src={assetUrl(screen.heroImage || '/welcome-hero.png')} alt="" className="w-full" style={{ aspectRatio: '448/244' }} />
      </div>

      {screen.bullets && (
        <div className="animate-in delay-3 flex flex-col gap-2">
          {screen.bullets.map((bullet, i) => {
            const b = typeof bullet === 'string' ? { text: bullet } : bullet
            const bgColors = { violett: 'bg-violett', orange: 'bg-orange', green: 'bg-green', pink: 'bg-pink' }
            const rotations = ['-3deg', '2.5deg', '-2deg']
            return (
              <div
                key={i}
                className={`flex gap-2 items-start rounded-2xl px-4 py-4 text-bright ${bgColors[b.color] || 'bg-violett'}`}
                style={{ transform: `rotate(${rotations[i] || '0deg'})`, zIndex: i }}
              >
                <span className="text-cta font-normal font-['Lacquer'] shrink-0 opacity-80">*</span>
                <span className="text-body font-medium">{b.text}</span>
              </div>
            )
          })}
        </div>
      )}

      {screen.socialProof && (
        <div className="animate-in delay-4">
          <SocialProofBadge
            title={screen.socialProof.title}
            text={screen.socialProof.text}
          />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="max-w-[448px] mx-auto flex flex-col items-center gap-2">
          <Button label={screen.cta} onClick={onNext} className="animate-btn-pulse" />
          {screen.trustText && (
            <p className="text-small text-dark text-center">{screen.trustText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
