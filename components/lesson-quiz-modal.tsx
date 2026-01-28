'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface LessonQuizModalProps {
  isOpen: boolean
  lessonTitle: string
  questions: QuizQuestion[]
  onClose: () => void
  onSubmit: (score: number) => void
}

export function LessonQuizModal({
  isOpen,
  lessonTitle,
  questions,
  onClose,
  onSubmit,
}: LessonQuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSubmit = () => {
    let correctCount = 0
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++
      }
    })
    const finalScore = Math.round((correctCount / questions.length) * 100)
    setScore(finalScore)
    setSubmitted(true)
  }

  const handleClose = () => {
    if (submitted) {
      onSubmit(score)
      setCurrentQuestion(0)
      setSelectedAnswers([])
      setSubmitted(false)
      setScore(0)
      onClose()
    } else {
      onClose()
    }
  }

  if (!question && !submitted) return null

  if (!submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lesson Quiz: {lessonTitle}</DialogTitle>
            <DialogDescription>
              Question {currentQuestion + 1} of {questions.length}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>
                  {currentQuestion + 1}/{questions.length}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">{question.question}</h3>

              {/* Options */}
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString() ?? ''}
                onValueChange={(value) => handleSelectAnswer(parseInt(value))}
              >
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="flex-1"
              >
                {isLastQuestion ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Results Screen
  const isPassed = score >= 70
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quiz Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 text-center">
          <div className="flex justify-center">
            {isPassed ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>

          <div>
            <h3 className="text-3xl font-bold text-foreground">{score}%</h3>
            <p className="text-lg text-muted-foreground mt-2">
              {isPassed ? '🎉 Great job! You passed!' : 'You can retake this quiz'}
            </p>
          </div>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answers:</span>
                  <span className="font-semibold">
                    {Math.round((score / 100) * questions.length)}/{questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passing Score:</span>
                  <span className="font-semibold">70%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleClose} className="w-full">
            {isPassed ? 'Continue to Next Lesson' : 'Retake Quiz'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
