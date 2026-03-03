/**
 * Analytics Events (for backend team):
 *
 * 1. email_submitted    — User submits email on capture/email screen
 *    Data: { email, segment, sessionId }
 *    Trigger: CTA click when email is valid
 *
 * 2. paywall_viewed     — Paywall screen is displayed
 *    Data: { segment, sessionId }
 *    Trigger: Screen mount
 *
 * 3. paywall_cta_clicked — User clicks "Get my plan" on paywall
 *    Data: { email, segment, sessionId }
 *    Trigger: CTA click
 *
 * 4. waitlist_confirmed  — Waitlist screen is displayed (user clicked buy)
 *    Data: { email, segment, sessionId }
 *    Trigger: Screen mount
 *
 * Integration: Add event listeners on elements with data-event attributes,
 * or wrap onNext callbacks to fire analytics before navigation.
 */

import Button from '../components/atoms/Button'
import TextInput from '../components/atoms/TextInput'
import { interpolate } from '../engine/computeVars'
import { assetUrl } from '../utils/assetUrl'

function EmailVariant({ screen, ctx, answer, onSelect }) {
  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      {screen.subtitle && (
        <p className="text-body text-grey text-center leading-[1.2]">{screen.subtitle}</p>
      )}

      <div className="animate-in delay-2">
        <TextInput
          value={answer || ''}
          onChange={(val) => onSelect(screen.field, val)}
          placeholder={screen.placeholder || 'your@email.com'}
        />
      </div>

      {screen.privacyText && (
        <p className="text-small text-grey text-center">{screen.privacyText}</p>
      )}

      {/* Testimonials */}
      {(screen.testimonials || (screen.testimonial ? [screen.testimonial] : [])).map((t, i) => (
        <div key={i} className="bg-beige rounded-xl p-5 w-full animate-in" style={{animationDelay: `${(i+2) * 150}ms`}}>
          <p className="text-body text-dark italic leading-[1.4]">"{interpolate(t.text, ctx)}"</p>
          <p className="text-small text-grey mt-2">— {interpolate(t.author, ctx)}</p>
        </div>
      ))}

      {screen.socialProofBadge && (
        <div className="flex items-center justify-center gap-2 py-2 animate-in delay-3">
          <img src={assetUrl('/laurel_l.png')} alt="" className="w-6 h-6 object-contain" />
          <div className="text-center">
            <p className="text-small font-bold tracking-wider uppercase text-dark">{screen.socialProofBadge.title}</p>
            <p className="text-small text-grey">{screen.socialProofBadge.text}</p>
          </div>
          <img src={assetUrl('/laurel_r.png')} alt="" className="w-6 h-6 object-contain" />
        </div>
      )}
    </>
  )
}

function PaywallVariant({ screen, ctx }) {
  const without = screen.comparison?.without || []
  const withSystem = screen.comparison?.with || []
  const pricing = screen.pricing || {}

  return (
    <>
      <div className="animate-in delay-1">
        <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark text-center">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      <div className="animate-in delay-2 flex gap-3 w-full">
        <div className="flex-1 border-2 border-orange rounded-xl p-3 flex flex-col gap-2">
          <p className="text-small font-bold text-orange text-center">WITHOUT</p>
          {without.map((item, i) => (
            <p key={i} className="text-small text-dark leading-[1.3]">
              {interpolate(item, ctx)}
            </p>
          ))}
        </div>
        <div className="flex-1 border-2 border-violett rounded-xl p-3 flex flex-col gap-2">
          <p className="text-small font-bold text-violett text-center">WITH</p>
          {withSystem.map((item, i) => (
            <p key={i} className="text-small text-dark leading-[1.3]">
              {interpolate(item, ctx)}
            </p>
          ))}
        </div>
      </div>

      <div className="animate-in delay-3 bg-beige rounded-2xl py-6 px-5 flex flex-col items-center gap-2 w-full">
        <p className="text-cta font-bold text-violett">{pricing.trial}</p>
        <p className="text-body text-dark">{pricing.price}</p>
        <p className="text-small text-grey">{pricing.guarantee}</p>
      </div>

      {screen.socialProof && (
        <p className="animate-in delay-4 text-small text-grey text-center">
          ★★★★★ {screen.socialProof}
        </p>
      )}
    </>
  )
}

function WaitlistVariant({ screen, ctx }) {
  return (
    <>
      <div className="h-10" />
      <div className="w-20 h-20 rounded-full bg-green flex items-center justify-center self-center animate-in">
        <span className="text-title font-bold text-bright">✓</span>
      </div>
      <h1 className="text-title font-title leading-[1.1] tracking-tight text-dark text-center animate-in delay-1">
        {screen.title}
      </h1>
      <p className="text-body text-grey text-center leading-[1.4] animate-in delay-1">
        {screen.subtitle}
      </p>
      <div className="bg-beige rounded-xl py-5 px-5 w-full text-center animate-in delay-2">
        <p className="text-small text-grey mb-1">We'll notify you at:</p>
        <p className="text-cta font-semibold text-dark">{ctx.email || 'your@email.com'}</p>
      </div>
      {screen.dynamicText && (
        <p className="text-body text-dark leading-[1.4] animate-in delay-2">
          {interpolate(
            screen.dynamicText.cases?.[ctx[screen.dynamicText.key]] || screen.dynamicText.default || '',
            ctx
          )}
        </p>
      )}
      {screen.warmMessage && (
        <div className="border border-border rounded-xl p-4 w-full animate-in delay-3">
          <p className="text-body text-dark leading-[1.4]">{screen.warmMessage}</p>
        </div>
      )}
    </>
  )
}

export default function CaptureScreen({ screen, answer, ctx = {}, onSelect, onNext, onBack }) {
  const variant = screen.variant || 'email'
  const isEmailValid = variant !== 'email' || (answer && answer.includes('@'))

  return (
    <div className="flex flex-col gap-5 min-h-dvh px-5 pt-4 pb-28 bg-bright">
      <div className="animate-in">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start cursor-pointer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {variant === 'email' && (
        <div data-event="email_submitted" data-segment={ctx.lifeStage}>
          <EmailVariant screen={screen} ctx={ctx} answer={answer} onSelect={onSelect} />
        </div>
      )}
      {variant === 'paywall' && (
        <div data-event="paywall_viewed" data-segment={ctx.lifeStage}>
          <PaywallVariant screen={screen} ctx={ctx} />
        </div>
      )}
      {variant === 'waitlist' && (
        <div data-event="waitlist_confirmed" data-segment={ctx.lifeStage}>
          <WaitlistVariant screen={screen} ctx={ctx} />
        </div>
      )}

      <div className="flex-1" />

      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-2 bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent">
        <div className="max-w-[448px] mx-auto flex flex-col items-center gap-2">
          <Button
            label={screen.cta || 'Continue →'}
            onClick={onNext}
            className={variant === 'email' && !isEmailValid ? 'opacity-40 pointer-events-none' : 'opacity-100'}
            data-event={variant === 'email' ? 'email_submitted' : variant === 'paywall' ? 'paywall_cta_clicked' : undefined}
            data-segment={ctx.lifeStage}
          />
          {screen.trustText && (
            <p className="text-small text-grey text-center">{screen.trustText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
