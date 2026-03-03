import QuizEngine from './engine/QuizEngine'
import quizConfig from '../quiz-data.json'

export default function App() {
  return (
    <div className="min-h-dvh flex justify-center bg-bright">
      <div className="w-full max-w-[448px]">
        <QuizEngine config={quizConfig} />
      </div>
    </div>
  )
}
