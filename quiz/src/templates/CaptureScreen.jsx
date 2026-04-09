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

import React, { useState } from 'react'
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

      {/* Testimonials — glass cards with Unsplash avatars */}
      {(screen.testimonials || []).map((t, i) => {
        const avatarUrl = interpolate(t.avatar || '', ctx)
        return (
          <div key={i} className="bg-white/10 border border-white/15 rounded-xl p-4 w-full animate-in" style={{ animationDelay: `${(i + 2) * 150}ms` }}>
            <p className="text-body text-bright italic leading-[1.4]">"{interpolate(t.text, ctx)}"</p>
            <div className="flex items-center gap-2.5 mt-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 shrink-0" />
              )}
              <p className="text-small text-bright/80">{interpolate(t.author, ctx)}</p>
            </div>
          </div>
        )
      })}
    </>
  )
}

function PricingCard({ plan, selected, onSelect }) {
  const isPopular = plan.popular
  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      className={`w-full rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all relative
        ${selected
          ? 'bg-violett/8 border-2 border-violett shadow-lg ring-1 ring-violett/20'
          : 'bg-bright border-2 border-dark'}
        ${isPopular ? 'py-5' : ''}`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-bright text-micro font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Most Popular
        </span>
      )}
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
        ${selected ? 'border-violett' : 'border-border'}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-violett" />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-body font-bold text-dark">{plan.label}</p>
        <p className="text-small text-grey">
          <span className="line-through">${plan.oldPrice}</span>{' '}
          <span className="text-dark font-semibold">${plan.price}</span>
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-baseline gap-0.5">
          <span className="text-small text-grey">$</span>
          <span className="font-title text-[36px] leading-none text-dark">{plan.perDay.split('.')[0]}</span>
          <span className="text-body text-dark font-bold">.{plan.perDay.split('.')[1]}</span>
        </div>
        <p className="text-micro text-grey">per day</p>
      </div>
    </button>
  )
}

function ImageSlider({ images }) {
  const [current, setCurrent] = useState(0)
  const touchStart = React.useRef(0)

  // Auto-advance every 3s
  React.useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % images.length), 3000)
    return () => clearInterval(t)
  }, [images.length])

  return (
    <div
      className="w-full overflow-hidden rounded-2xl relative"
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const diff = touchStart.current - e.changedTouches[0].clientX
        if (diff > 50) setCurrent(c => (c + 1) % images.length)
        if (diff < -50) setCurrent(c => (c - 1 + images.length) % images.length)
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <img key={i} src={img} alt="" className="w-full shrink-0 aspect-[4/3] object-cover" />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === current ? 'bg-dark w-5' : 'bg-dark/30 w-2'}`} />
        ))}
      </div>
    </div>
  )
}

function PaywallVariant({ screen, ctx, onBuy, selectedPlan, setSelectedPlan }) {
  const plans = screen.plans || []
  const faqs = screen.faqs || []
  const testimonials = screen.paywallTestimonials || []
  const benefits = screen.benefits || []
  const sliderImages = (screen.sliderImages || []).map(p => assetUrl(p))
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const selected = plans.find(p => p.id === selectedPlan) || plans[0]

  // Countdown timer
  React.useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <>
      {/* Discount banner */}
      <div className="flex items-center gap-2 bg-green/15 rounded-xl px-4 py-2.5 w-full animate-in">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green shrink-0">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-body font-semibold text-dark">15% discount applied!</p>
      </div>

      {/* Title — above the slider */}
      <div className="animate-in delay-1 w-full">
        <h1 className="font-title text-[32px] leading-[1.1] tracking-tight text-dark">
          {interpolate(screen.title, ctx)}
        </h1>
      </div>

      {/* Image slider */}
      {sliderImages.length > 0 && (
        <div className="w-full animate-in delay-1">
          <ImageSlider images={sliderImages} />
        </div>
      )}

      {/* What you get */}
      {benefits.length > 0 && (
        <div className="w-full animate-in delay-2">
          <p className="text-cta font-semibold text-violett mb-3">What you'll get:</p>
          <div className="flex flex-col gap-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-body text-dark leading-[1.4]">{interpolate(b, ctx)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time remaining */}
      <div className="bg-green rounded-2xl py-4 px-5 w-full text-center animate-in delay-2">
        <p className="text-body text-dark">Your personalized plan has been saved for the next 5 minutes</p>
        <p className="text-body font-bold text-dark mt-2">Time remaining:</p>
        <p className="font-title text-[40px] text-dark leading-none mt-1">{mins}:{secs}</p>
      </div>

      {/* Money back guarantee */}
      {screen.guarantee && (
        <div className="border-2 border-border rounded-2xl p-5 w-full text-center animate-in delay-2">
          <div className="flex justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-title text-[22px] text-dark mb-2">{screen.guarantee.title}</h3>
          <p className="text-body text-dark leading-[1.5]">{screen.guarantee.text}</p>
        </div>
      )}

      {/* Choose Your Plan */}
      <div className="w-full animate-in delay-3">
        <h2 className="font-title text-[24px] text-dark text-center mb-5">Choose Your Plan</h2>
        <div className="flex flex-col gap-4">
          {plans.map(plan => (
            <PricingCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} onSelect={setSelectedPlan} />
          ))}
        </div>
      </div>

      {/* Guarantee one-liner */}
      <p className="text-body text-dark text-center animate-in delay-3">
        30-day <span className="text-green font-semibold underline">money back guarantee</span>
      </p>

      {/* CTA inline */}
      <div className="w-full animate-in delay-3 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onBuy}
          className="w-full h-[56px] rounded-full bg-green text-bright font-sans text-cta font-semibold
            flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          data-event="paywall_cta_clicked"
          data-plan={selectedPlan}
          data-segment={ctx.lifeStage}
        >
          Get My Plan — ${selected?.perDay}/day
        </button>
        {/* Pay Safe badge */}
        <div className="flex items-center justify-center gap-1.5 bg-green/10 rounded-full px-4 py-1.5 mt-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-body font-semibold text-green">Pay Safe &amp; Secure</span>
        </div>
        {/* Payment logos in bordered boxes */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {['PayPal', 'Apple Pay', 'VISA', 'MC', 'AMEX'].map(name => (
            <div key={name} className="border border-border rounded-lg px-2.5 py-1.5 flex items-center justify-center h-9 min-w-[48px]">
              <span className="text-micro font-bold text-dark">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="w-full animate-in delay-3">
          <h2 className="font-title text-[24px] text-dark text-center mb-4">Real people. Real stories</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t, i) => {
              const avatarUrl = interpolate(t.avatar || '', ctx)
              return (
                <div key={i} className="bg-beige rounded-2xl p-4">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-orange text-body">★</span>
                    ))}
                  </div>
                  <p className="text-body text-dark italic leading-[1.4]">"{interpolate(t.text, ctx)}"</p>
                  <div className="flex items-center gap-2.5 mt-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-border shrink-0" />
                    )}
                    <p className="text-small text-dark font-semibold">{interpolate(t.author, ctx)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="w-full animate-in delay-4">
          <h2 className="font-title text-[24px] text-dark text-center mb-4">People often ask</h2>
          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-beige border border-border rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer text-body font-semibold text-dark list-none">
                  {faq.q}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-grey shrink-0 transition-transform group-open:rotate-180">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-small text-grey leading-[1.5]">{faq.a}</p>
                </div>
              </details>
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
  const isPaywall = variant === 'paywall'
  const plans = screen.plans || []
  const [selectedPlan, setSelectedPlan] = useState(plans.find(p => p.popular)?.id || plans[0]?.id)
  const [showPopup, setShowPopup] = useState(false)

  const wrapperClasses = [
    'flex flex-col gap-5 min-h-dvh px-5 pt-4',
    isPaywall ? 'pb-8' : 'pb-28',
    isDark ? 'screen-dark' : 'bg-bright',
  ].join(' ')

  const arrowColor = isDark ? 'text-bright' : 'text-dark'

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

      <div className={`flex flex-col gap-5 w-full ${isDark ? 'mt-6' : ''}`}>
        {variant === 'email' && (
          <div className="flex flex-col gap-5 w-full" data-event="email_submitted" data-segment={ctx.lifeStage}>
            <EmailVariant screen={screen} ctx={ctx} answer={answer} onSelect={onSelect} />
          </div>
        )}
        {variant === 'paywall' && (
          <div className="flex flex-col gap-5 w-full" data-event="paywall_viewed" data-segment={ctx.lifeStage}>
            <PaywallVariant
              screen={screen}
              ctx={ctx}
              onBuy={() => setShowPopup(true)}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
            />
          </div>
        )}
        {variant === 'waitlist' && (
          <div className="flex flex-col gap-5 w-full" data-event="waitlist_confirmed" data-segment={ctx.lifeStage}>
            <WaitlistVariant screen={screen} ctx={ctx} />
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Fixed CTA footer — hidden for paywall (inline CTA instead) */}
      {!isPaywall && (
        <div className={`fixed bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-2 ${ctaFooterBg}`}>
          <div className="max-w-[448px] mx-auto flex flex-col items-center gap-2">
            <Button
              label={screen.cta || 'Continue →'}
              onClick={onNext}
              className={variant === 'email' && !isEmailValid ? 'opacity-40 pointer-events-none' : 'opacity-100'}
              data-event={variant === 'email' ? 'email_submitted' : undefined}
              data-segment={ctx.lifeStage}
            />
            {screen.trustText && (
              <p className={`text-small text-center ${isDark ? 'text-bright' : 'text-grey'}`}>{screen.trustText}</p>
            )}
          </div>
        </div>
      )}

      {/* Waitlist popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-dark/60" onClick={() => setShowPopup(false)}>
          <div className="bg-bright rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-green flex items-center justify-center">
              <span className="text-[28px] text-bright font-bold">✓</span>
            </div>
            <h3 className="font-title text-[24px] text-dark">You're on the list!</h3>
            <p className="text-body text-grey leading-[1.5]">
              We're in early access and have reached our testing capacity.
              Your personalized plan is saved — we'll email you the moment a spot opens.
            </p>
            {ctx.email && (
              <p className="text-body text-dark font-semibold">{ctx.email}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="w-full h-12 rounded-full bg-dark text-bright text-body font-semibold cursor-pointer hover:opacity-90 transition-all mt-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
