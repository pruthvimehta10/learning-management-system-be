'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

interface Question {
    id: string
    question_text: string
    correct_answer: number
    options: string[]
}

interface Course {
    id: string
    title: string
}

interface ExamInterfaceProps {
    course: Course
    questions: Question[]
}

export function ExamInterface({ course, questions }: ExamInterfaceProps) {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    if (questions.length === 0) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-black text-foreground">No exam questions available.</h2>
                <Button asChild className="mt-4 border-4 border-foreground bg-primary text-primary-foreground font-black">
                    <Link href={`/courses/${course.id}`}>Back to Course</Link>
                </Button>
            </div>
        </div>
    )

    const handleSelectAnswer = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers]
        newAnswers[currentQuestion] = optionIndex
        setSelectedAnswers(newAnswers)
    }

    const handleSubmit = () => {
        let correctCount = 0
        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correct_answer) {
                correctCount++
            }
        })
        const finalScore = Math.round((correctCount / questions.length) * 100)
        setScore(finalScore)
        setSubmitted(true)
    }

    const isPassed = score >= 70

    if (submitted) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <Card className="border-4 border-foreground" style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.15)' }}>
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="flex justify-center">
                                {isPassed ? (
                                    <CheckCircle className="h-24 w-24 text-green-600" />
                                ) : (
                                    <XCircle className="h-24 w-24 text-destructive" />
                                )}
                            </div>

                            <div>
                                <h1 className="text-4xl font-black text-foreground mb-2">
                                    {isPassed ? 'Congratulations!' : 'Exam Failed'}
                                </h1>
                                <p className="text-xl text-foreground font-semibold">
                                    You scored {score}% on the Final Exam.
                                </p>
                            </div>

                            {isPassed && (
                                <div className="bg-secondary p-6 border-4 border-foreground my-6">
                                    <p className="font-bold text-lg mb-2">Certificate of Completion</p>
                                    <p className="text-sm">You have successfully completed {course.title}.</p>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <Button asChild className="border-4 border-foreground bg-background text-foreground font-black hover:bg-muted">
                                    <Link href={`/courses/${course.id}`}>Back to Course</Link>
                                </Button>
                                {!isPassed && (
                                    <Button onClick={() => {
                                        setSubmitted(false)
                                        setCurrentQuestion(0)
                                        setSelectedAnswers([])
                                        setScore(0)
                                    }} className="border-4 border-foreground bg-primary text-primary-foreground font-black">
                                        Retake Exam
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const question = questions[currentQuestion]
    const isLastQuestion = currentQuestion === questions.length - 1

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="mb-8 flex items-center gap-4">
                    <Button asChild variant="ghost" className="hover:bg-transparent pl-0">
                        <Link href={`/courses/${course.id}`} className="flex items-center gap-2 font-bold text-foreground">
                            <ArrowLeft className="h-5 w-5" /> Back to Course
                        </Link>
                    </Button>
                </div>

                <Card className="border-4 border-foreground" style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.15)' }}>
                    <CardHeader className="border-b-4 border-foreground bg-secondary/30 p-6">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-black">Final Exam: {course.title}</CardTitle>
                            <span className="font-bold bg-background border-2 border-foreground px-3 py-1 text-sm">
                                Question {currentQuestion + 1}/{questions.length}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-secondary border-2 border-foreground rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-foreground">{question.question_text}</h2>

                            <RadioGroup
                                value={selectedAnswers[currentQuestion]?.toString() ?? ''}
                                onValueChange={(value) => handleSelectAnswer(parseInt(value))}
                            >
                                <div className="space-y-3">
                                    {question.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-3 transition-transform active:scale-[0.99]">
                                            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-2 border-foreground text-primary" />
                                            <Label
                                                htmlFor={`option-${index}`}
                                                className="flex-1 cursor-pointer p-4 rounded-xl border-2 border-foreground hover:bg-secondary/50 font-semibold transition-colors checked:bg-primary/10"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex justify-between pt-4 border-t-2 border-slate-200">
                            <Button
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                variant="outline"
                                className="border-4 border-foreground font-bold"
                            >
                                Previous
                            </Button>

                            {isLastQuestion ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswers.length !== questions.length || selectedAnswers.includes(undefined as any)}
                                    className="border-4 border-foreground bg-green-600 hover:bg-green-700 text-white font-black px-8"
                                >
                                    Submit Exam
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                    disabled={selectedAnswers[currentQuestion] === undefined}
                                    className="border-4 border-foreground bg-primary text-primary-foreground font-black px-8"
                                >
                                    Next Question
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
