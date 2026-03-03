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
    currentStep,
    totalSteps,
    answers,
    ctx,
    next,
    prev,
    setAnswer,
    toggleMultiAnswer,
  } = useQuizState(config)

  if (!currentScreen) return null

  const Template = templates[currentScreen.type]

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
      onNext={next}
      onBack={prev}
    />
  )
}
