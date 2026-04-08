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
        <h1 className="font-title text-[40px] leading-[1.1] tracking-tight text-bright">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      {screen.subtitle && (
        <div className="flex items-center gap-2 animate-in delay-1">
          <p className="text-cta text-bright leading-[1.2]">{interpolate(screen.subtitle, ctx)}</p>
          {screen.freeBadge && (
            <span className="bg-green text-bright text-body font-semibold rounded-full px-3 py-1 shrink-0">
              {screen.freeBadge}
            </span>
          )}
        </div>
      )}

      {/* Email input — glass style on dark bg */}
      <div className="animate-in delay-2 w-full">
        <div className="flex items-center gap-2.5 bg-white/20 border border-white/20 rounded-xl h-14 px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-bright shrink-0">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            type="email"
            value={answer || ''}
            onChange={(e) => onSelect(screen.field, e.target.value)}
            placeholder={screen.placeholder || 'your@email.com'}
            className="bg-transparent text-bright placeholder:text-bright/60 text-body w-full outline-none"
          />
        </div>
      </div>

      {/* Trust header */}
      {screen.socialProofBadge && (
        <p className="text-body font-semibold text-bright text-center animate-in delay-2">
          {screen.socialProofBadge.title} · {screen.socialProofBadge.text}
        </p>
      )}

      {/* Testimonials — glass cards */}
      {(screen.testimonials || []).map((t, i) => (
        <div key={i} className="glass-card rounded-xl p-4 w-full animate-in" style={{ animationDelay: `${(i + 2) * 150}ms` }}>
          <p className="text-body text-bright italic leading-[1.4]">"{interpolate(t.text, ctx)}"</p>
          <div className="flex items-center gap-2 mt-2.5">
            {/* Avatar placeholder */}
            <div className="w-6 h-6 rounded-full bg-white/20 shrink-0" />
            <p className="text-small text-bright/80">{interpolate(t.author, ctx)}</p>
          </div>
        </div>
      ))}
    </>
  )
}

function PaywallVariant({ screen, ctx }) {
  const pricing = screen.pricing || {}
  const faqs = screen.faqs || []
  const previewPhotos = screen.previewPhotos || []
  const features = screen.features || []
  const testimonials = screen.paywallTestimonials || []

  return (
    <>
      {/* Hero section */}
      <div className="flex flex-col items-center gap-2 animate-in delay-1 w-full">
        <h1 className="font-title text-[38px] leading-[1.08] text-bright text-center">
          {interpolate(screen.title, ctx)}
        </h1>
        {screen.heroSubtitle && (
          <p className="text-small text-bright/70 text-center">
            {interpolate(screen.heroSubtitle, ctx)}
          </p>
        )}
        {/* Hero image */}
        {screen.heroImage ? (
          <div className="w-full h-[220px] rounded-2xl overflow-hidden mt-2">
            <img src={assetUrl(screen.heroImage)} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-[220px] rounded-2xl bg-white/10 flex items-center justify-center mt-2">
            <span className="text-bright/40 text-small">hero image</span>
          </div>
        )}
      </div>

      {/* Social proof — pink card with laurels + testimonials */}
      <div className="bg-pink rounded-2xl pt-4 pb-5 px-5 w-full animate-in delay-2">
        {/* Rating badge with laurels */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={assetUrl('/laurel_l.png')} alt="" className="w-8 h-10 object-contain" />
          <div className="flex flex-col items-center">
            <p className="text-body font-bold text-bright">MealPreply PRO</p>
            <p className="text-small text-bright">4.8★ · 12K users</p>
          </div>
          <img src={assetUrl('/laurel_r.png')} alt="" className="w-8 h-10 object-contain" />
        </div>
        {/* Testimonials */}
        <div className="flex flex-col gap-2.5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-bright rounded-xl p-3 flex flex-col gap-2">
              <p className="text-small text-dark italic leading-[1.4]">"{interpolate(t.text, ctx)}"</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-border shrink-0" />
                <p className="text-micro text-grey">{interpolate(t.author, ctx)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan preview — square food photos + feature cards */}
      <div className="w-full animate-in delay-2">
        <p className="text-cta font-bold text-bright mb-3">
          {screen.previewTitle || "Here's your weekly plan!"}
        </p>
        {/* Square photo grid */}
        <div className="flex gap-2 w-full">
          {previewPhotos.map((photo, i) => (
            <div key={i} className="flex-1 aspect-square rounded-xl overflow-hidden border border-white/20">
              <img src={assetUrl(photo)} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {/* Feature cards */}
        {features.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            {features.map((feat, i) => (
              <div key={i} className="bg-white/[0.06] rounded-xl py-3 px-3">
                <p className="text-small text-bright">{interpolate(feat, ctx)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing card */}
      <div className="bg-beige rounded-2xl p-5 flex flex-col items-center gap-3 w-full animate-in delay-3">
        <p className="text-lg font-bold text-violett">{pricing.trial}</p>
        <p className="text-body text-dark">{pricing.price}</p>
        <p className="text-small text-grey">{pricing.guarantee}</p>
        <button
          onClick={() => {}}
          className="w-full h-[50px] rounded-full bg-green text-bright font-sans text-cta
            flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all mt-1"
        >
          {screen.pricingCta || 'Start my free trial →'}
        </button>
      </div>

      {/* Guarantee */}
      {screen.guarantee && (
        <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2.5 w-full animate-in delay-3">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-green">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p className="text-cta font-bold text-bright">{screen.guarantee.title}</p>
          <p className="text-small text-bright/70 text-center">{screen.guarantee.text}</p>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="w-full animate-in delay-4">
          <p className="text-body font-bold text-bright mb-2.5">
            {screen.faqTitle || 'People often ask'}
          </p>
          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.06] rounded-xl py-3 px-3">
                <p className="text-small font-bold text-bright">{faq.q}</p>
                <p className="text-small text-bright/70 mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
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
  const isDark = screen.theme === 'dark'

  const wrapperClasses = [
    'flex flex-col gap-5 min-h-dvh px-5 pt-4 pb-28',
    isDark ? 'screen-dark' : 'bg-bright',
  ].join(' ')

  const arrowColor = isDark ? 'text-bright' : 'text-dark'

  // Paywall variant scrolls naturally, no fixed CTA needed (CTA is inline in pricing card)
  const showFixedCta = variant !== 'paywall' || !isDark

  const ctaFooterBg = isDark
    ? 'bg-violett'
    : 'bg-gradient-to-t from-[#FBFBFB] via-[#FBFBFB] to-transparent'

  return (
    <div className={wrapperClasses}>
      <div className="animate-in">
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-start cursor-pointer ${arrowColor}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {variant === 'email' && (
        <div className="flex flex-col gap-5 w-full" data-event="email_submitted" data-segment={ctx.lifeStage}>
          <EmailVariant screen={screen} ctx={ctx} answer={answer} onSelect={onSelect} />
        </div>
      )}
      {variant === 'paywall' && (
        <div className="flex flex-col gap-5 w-full" data-event="paywall_viewed" data-segment={ctx.lifeStage}>
          <PaywallVariant screen={screen} ctx={ctx} />
        </div>
      )}
      {variant === 'waitlist' && (
        <div className="flex flex-col gap-5 w-full" data-event="waitlist_confirmed" data-segment={ctx.lifeStage}>
          <WaitlistVariant screen={screen} ctx={ctx} />
        </div>
      )}

      <div className="flex-1" />

      {/* Fixed CTA footer: solid violet on dark, gradient fade on light */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-2 ${ctaFooterBg}`}>
        <div className="max-w-[448px] mx-auto flex flex-col items-center gap-2">
          {isDark && variant === 'paywall' ? (
            <button
              onClick={onNext}
              className="w-full h-[50px] rounded-full bg-green text-bright font-sans text-cta
                flex items-center justify-center cursor-pointer
                hover:opacity-90 active:scale-[0.98] transition-all"
              data-event="paywall_cta_clicked"
              data-segment={ctx.lifeStage}
            >
              {screen.bottomCta || screen.cta || 'Start my free trial →'}
            </button>
          ) : (
            <Button
              label={screen.cta || 'Continue →'}
              onClick={onNext}
              className={variant === 'email' && !isEmailValid ? 'opacity-40 pointer-events-none' : 'opacity-100'}
              data-event={variant === 'email' ? 'email_submitted' : variant === 'paywall' ? 'paywall_cta_clicked' : undefined}
              data-segment={ctx.lifeStage}
            />
          )}
          {screen.trustText && (
            <p className={`text-small text-center ${isDark ? 'text-bright' : 'text-grey'}`}>{screen.trustText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
