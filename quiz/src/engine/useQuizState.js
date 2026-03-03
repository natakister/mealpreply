import { useState, useCallback, useMemo } from 'react'
import { resolveVars } from './computeVars'

// ── Deep linking: ?screen=screen-id&segment=busy_parent ──
const _urlParams = new URLSearchParams(window.location.search)
const _deepScreen = _urlParams.get('screen')
const _deepSegment = _urlParams.get('segment')

const SEGMENT_DEFAULTS = {
  busy_parent:  { lifeStage: 'busy_parent', adults: 2, kids: 2, kidsChallenge: 'picky', parentStress: 'deciding' },
  health_focus: { lifeStage: 'health_focus', peopleFed: 1, workoutDays: 4, fitnessGoal: 'cut', prepBurnout: 'boredom' },
  busy_pro:     { lifeStage: 'busy_pro', peopleFed: 1, workEnergy: 'tired', cookingRelation: 'tolerate' },
  budget:       { lifeStage: 'budget', peopleFed: 2, wasteSource: 'fridge_spoils', shoppingPattern: 'big_weekly' },
}

const SHARED_DEFAULTS = {
  mainGoal: 'mental_load', dietary: ['none'], allergies: ['none'],
  kitchenEquipment: ['basic', 'sheet_pans'], mealComplexity: 'simple',
  currentFrequency: 'sometimes', midweekPattern: 'improvise', priority: 'decisions',
}

function evaluateCondition(condition, ctx, answers) {
  if (!condition) return true
  const { field, operator, value, computed } = condition
  const actual = computed ? ctx[field] : answers[field]
  switch (operator) {
    case '===': return actual === value
    case '!==': return actual !== value
    case '>':   return actual > value
    case '>=':  return actual >= value
    case '<':   return actual < value
    case '<=':  return actual <= value
    case 'includes': return Array.isArray(actual) && actual.includes(value)
    default: return true
  }
}

function getNumberDefaults(screens) {
  const defaults = {}
  for (const screen of screens) {
    if (screen.type === 'number_input' && screen.fields) {
      for (const f of screen.fields) {
        if (f.default != null) defaults[f.id] = f.default
      }
    }
  }
  return defaults
}

export default function useQuizState(config) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!_deepScreen || !_deepSegment) return 0
    const allDefaults = { ...getNumberDefaults(config.screens), ...SHARED_DEFAULTS, ...(SEGMENT_DEFAULTS[_deepSegment] || {}) }
    const vars = resolveVars(config.computedVars, allDefaults)
    const ctx = { ...allDefaults, ...vars }
    const visible = config.screens.filter(s => evaluateCondition(s.condition, ctx, allDefaults))
    const idx = visible.findIndex(s => s.id === _deepScreen)
    return idx >= 0 ? idx : 0
  })

  const [answers, setAnswers] = useState(() => {
    const defaults = getNumberDefaults(config.screens)
    if (_deepScreen && _deepSegment) {
      Object.assign(defaults, SHARED_DEFAULTS, SEGMENT_DEFAULTS[_deepSegment] || {})
    }
    return defaults
  })

  const vars = useMemo(
    () => resolveVars(config.computedVars, answers),
    [config.computedVars, answers]
  )

  // Merged context: answers + computed vars
  const ctx = useMemo(() => ({ ...answers, ...vars }), [answers, vars])

  const visibleScreens = useMemo(() => {
    return config.screens.filter((screen) => {
      if (!screen.condition) return true
      const { field, operator, value, computed } = screen.condition
      const actual = computed ? ctx[field] : answers[field]
      switch (operator) {
        case '===': return actual === value
        case '!==': return actual !== value
        case '>':   return actual > value
        case '>=':  return actual >= value
        case '<':   return actual < value
        case '<=':  return actual <= value
        case 'includes':
          return Array.isArray(actual) && actual.includes(value)
        default: return true
      }
    })
  }, [config.screens, answers, ctx])

  const currentScreen = visibleScreens[currentIndex]
  const totalSteps = visibleScreens.filter(s => s.field).length
  const currentStep = visibleScreens.slice(0, currentIndex + 1).filter(s => s.field).length

  const next = useCallback(() => {
    if (currentIndex < visibleScreens.length - 1) {
      setCurrentIndex(i => i + 1)
      window.scrollTo(0, 0)
    }
  }, [currentIndex, visibleScreens.length])

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      window.scrollTo(0, 0)
    }
  }, [currentIndex])

  const setAnswer = useCallback((field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleMultiAnswer = useCallback((field, value, exclusiveOptions = []) => {
    setAnswers(prev => {
      const current = prev[field] || []
      // Clicking an exclusive option clears everything else
      if (exclusiveOptions.includes(value)) {
        return { ...prev, [field]: [value] }
      }
      // Remove exclusive options when clicking non-exclusive
      const filtered = current.filter(v => !exclusiveOptions.includes(v))
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter(v => v !== value) }
      }
      return { ...prev, [field]: [...filtered, value] }
    })
  }, [])

  return {
    currentScreen,
    currentIndex,
    currentStep,
    totalSteps,
    answers,
    vars,
    ctx,
    next,
    prev,
    setAnswer,
    toggleMultiAnswer,
  }
}
