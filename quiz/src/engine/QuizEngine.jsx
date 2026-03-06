import { useCallback, useEffect, useMemo, useRef } from 'react'
import useQuizState from './useQuizState'
import WelcomeScreen from '../templates/WelcomeScreen'
import SingleChoiceScreen from '../templates/SingleChoiceScreen'
import MultiChoiceScreen from '../templates/MultiChoiceScreen'
import MultiChoiceCustomScreen from '../templates/MultiChoiceCustomScreen'
import NumberInputScreen from '../templates/NumberInputScreen'
import InterstitialScreen from '../templates/InterstitialScreen'
import AnalyzingScreen from '../templates/AnalyzingScreen'
import SingleChoiceDynamicScreen from '../templates/SingleChoiceDynamicScreen'
import InfoScreen from '../templates/InfoScreen'
import CaptureScreen from '../templates/CaptureScreen'
import { getOrCreateSessionId, trackEvent, trackEventOnce } from '../lib/gsheetsTelemetry'

const templates = {
  welcome: WelcomeScreen,
  single_choice: SingleChoiceScreen,
  single_choice_dynamic: SingleChoiceDynamicScreen,
  multi_choice: MultiChoiceScreen,
  multi_choice_custom: MultiChoiceCustomScreen,
  number_input: NumberInputScreen,
  interstitial: InterstitialScreen,
  analyzing: AnalyzingScreen,
  info: InfoScreen,
  capture: CaptureScreen,
}

export default function QuizEngine({ config }) {
  const {
    currentScreen,
    currentIndex,
    currentStep,
    totalSteps,
    answers,
    ctx,
    next,
    prev,
    setAnswer,
    toggleMultiAnswer,
  } = useQuizState(config)

  const sessionIdRef = useRef(null)
  if (sessionIdRef.current === null) {
    sessionIdRef.current = getOrCreateSessionId()
  }
  const sessionId = sessionIdRef.current

  if (!currentScreen) return null

  const Template = templates[currentScreen.type]
  const answerFields = useMemo(() => {
    const fields = []
    const seen = new Set()
    for (const screen of config?.screens || []) {
      if (screen?.field && !seen.has(screen.field)) {
        seen.add(screen.field)
        fields.push(screen.field)
      }
      if (Array.isArray(screen?.fields)) {
        for (const fieldConfig of screen.fields) {
          const fieldId = fieldConfig?.id
          if (fieldId && !seen.has(fieldId)) {
            seen.add(fieldId)
            fields.push(fieldId)
          }
        }
      }
    }
    return fields
  }, [config?.screens])

  const screenPosById = useMemo(() => {
    const map = new Map()
    for (let index = 0; index < (config?.screens || []).length; index += 1) {
      map.set(config.screens[index].id, index)
    }
    return map
  }, [config?.screens])

  const buildBasePayload = useCallback(() => {
    const screenPos = screenPosById.get(currentScreen?.id)
    return {
      sessionId,
      configId: config?.id || '',
      segment: ctx?.lifeStage || '',
      screenId: currentScreen?.id || '',
      screenPos: Number.isFinite(screenPos) ? screenPos : null,
      visibleIndex: currentIndex
    }
  }, [config?.id, ctx?.lifeStage, currentIndex, currentScreen?.id, screenPosById, sessionId])

  useEffect(() => {
    trackEventOnce(`quiz_start:${sessionId}`, 'quiz_start', {
      sessionId,
      configId: config?.id || '',
      segment: ctx?.lifeStage || ''
    })
  }, [config?.id, ctx?.lifeStage, sessionId])

  useEffect(() => {
    if (!Array.isArray(config?.screens) || config.screens.length === 0) return
    trackEventOnce(`quiz_config:${sessionId}:${config?.id || 'default'}`, 'quiz_config', {
      sessionId,
      configId: config?.id || '',
      answerFields,
      screenOrder: config.screens.map((screen, index) => ({
        screenId: screen.id,
        screenPos: index
      }))
    })
  }, [answerFields, config?.id, config?.screens, sessionId])

  useEffect(() => {
    if (!currentScreen?.id) return
    const base = buildBasePayload()
    trackEventOnce(`screen_view:${sessionId}:${currentScreen.id}`, 'screen_view', base)
    if (currentScreen.type === 'capture' && currentScreen.variant === 'paywall') {
      trackEventOnce(`paywall_viewed:${sessionId}:${currentScreen.id}`, 'paywall_viewed', base)
    }
  }, [buildBasePayload, currentScreen?.id, currentScreen?.type, currentScreen?.variant, sessionId])

  const nextWithTelemetry = useCallback(() => {
    if (!currentScreen) return

    const base = buildBasePayload()
    trackEvent('answer_snapshot', {
      ...base,
      answers
    })

    if (currentScreen.type === 'capture' && currentScreen.variant === 'email') {
      const email = String(answers?.email || '').trim()
      if (email) {
        trackEvent('email_submitted', {
          ...base,
          email
        })
      }
    }

    if (currentScreen.type === 'capture' && currentScreen.variant === 'paywall') {
      const email = String(answers?.email || '').trim()
      trackEvent('checkout_initiated', {
        ...base,
        email
      })
    }

    next()
  }, [answers, buildBasePayload, currentScreen, next])

  if (!Template) {
    return (
      <div className="p-10 text-center text-grey">
        Template "{currentScreen.type}" not implemented yet.
      </div>
    )
  }

  return (
    <Template
      key={currentScreen.id}
      screen={currentScreen}
      step={currentStep}
      totalSteps={totalSteps}
      answer={currentScreen.field ? answers[currentScreen.field] : null}
      answers={answers}
      ctx={ctx}
      onSelect={setAnswer}
      onToggleMulti={toggleMultiAnswer}
      onNext={nextWithTelemetry}
      onBack={prev}
    />
  )
}
