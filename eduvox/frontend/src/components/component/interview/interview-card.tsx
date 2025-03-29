"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Bot, Mic, MicOff, SkipForward, Loader2, Volume2, VolumeX } from "lucide-react"

const getTitleFromId = (id: string) => {
  const categories: Record<string, string> = {
    tech: "Technical Interview",
    business: "Business Interview",
    corporate: "Corporate Interview",
    hr: "HR & Behavioral Interview",
    academic: "Academic Interview",
  }
  return categories[id] || "Interview"
}

const getQuestionsByCategory = (category: string, hasResume: boolean) => {
  // Base questions for each category
  const baseQuestions: Record<string, string[]> = {
    tech: [
      "Explain a time when you had to solve a complex technical problem.",
      "What programming languages are you most familiar with?",
      "How do you stay updated with the latest technology trends?",
      "Describe your approach to debugging a difficult issue.",
      "How do you ensure code quality in your projects?",
    ],
    business: [
      "Tell me about a time you had to make a difficult business decision.",
      "How do you approach financial forecasting?",
      "Describe your experience with strategic planning.",
      "How do you handle conflicts within a team?",
      "What methods do you use to evaluate business opportunities?",
    ],
    corporate: [
      "How do you ensure alignment with corporate objectives?",
      "Describe your experience working with cross-functional teams.",
      "How do you navigate corporate politics?",
      "Tell me about a time you led a significant change within an organization.",
      "How do you approach resource allocation in a large organization?",
    ],
    hr: [
      "Tell me about yourself.",
      "What are your greatest strengths and weaknesses?",
      "Why do you want to work for this company?",
      "Where do you see yourself in five years?",
      "Describe a time when you had to adapt to a significant change.",
    ],
    academic: [
      "Describe your research methodology.",
      "How do you approach teaching complex concepts?",
      "What is your publication strategy?",
      "How do you stay current in your academic field?",
      "Describe your approach to student mentorship.",
    ],
  }

  // If resume is uploaded, add personalized questions
  if (hasResume) {
    const personalizedQuestions: Record<string, string[]> = {
      tech: [
        "Based on your experience with React, how would you optimize a slow-rendering component?",
        "I see you worked with cloud services. How would you design a scalable microservice architecture?",
      ],
      business: [
        "Your resume mentions experience with market analysis. Can you describe a specific insight that led to a business opportunity?",
        "How did you apply financial modeling in your previous role to improve decision-making?",
      ],
      corporate: [
        "Your resume shows experience in a matrix organization. How did you manage competing priorities?",
        "Based on your previous role, how would you approach change management in a large enterprise?",
      ],
      hr: [
        "I noticed a gap in your employment history. Can you tell me more about that period?",
        "Your resume highlights leadership experience. Describe your management style with specific examples.",
      ],
      academic: [
        "Your publication history shows an interest in machine learning. How do you see this field evolving?",
        "Based on your teaching experience, how do you adapt your methods for different learning styles?",
      ],
    }

    return [...(personalizedQuestions[category] || []), ...baseQuestions[category]]
  }

  return baseQuestions[category] || baseQuestions.hr
}

interface InterviewCardProps {
  category: string
  hasResume?: boolean
}

export function InterviewCard({ category, hasResume = false }: InterviewCardProps) {
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userResponse, setUserResponse] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [progress, setProgress] = useState(0)
  const [textToSpeech, setTextToSpeech] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState("")

  const questions = getQuestionsByCategory(category, hasResume)
  const totalQuestions = questions.length
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (isStarted) {
      setProgress((currentQuestionIndex / totalQuestions) * 100)

      // Simulate AI typing effect for the first question
      if (currentQuestionIndex === 0) {
        simulateTyping(currentQuestion)
      }
    }
  }, [currentQuestionIndex, isStarted, totalQuestions, currentQuestion])

  const simulateTyping = (text: string) => {
    setIsTyping(true)
    setTypingText("")

    let i = 0
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypingText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)

        // Speak the text if text-to-speech is enabled
        if (textToSpeech) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.rate = 1.0
          utterance.pitch = 1.0
          window.speechSynthesis.speak(utterance)
        }
      }
    }, 30)
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  const handleNextQuestion = () => {
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      const feedbacks = [
        "Good answer! Your response was clear and well-structured.",
        "You provided relevant examples, which strengthens your answer.",
        "Consider being more specific about the outcomes of your actions.",
        "Your answer shows good problem-solving skills.",
        "Try to quantify your achievements when possible.",
      ]

      setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)])
      setIsProcessing(false)

      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1)
          setUserResponse("")
          setFeedback("")

          // Simulate typing for the next question
          simulateTyping(questions[currentQuestionIndex + 1])
        } else {
          // Interview completed
          setProgress(100)
        }
      }, 3000)
    }, 1500)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const toggleTextToSpeech = () => {
    setTextToSpeech(!textToSpeech)
  }

  return (
    <Card className="neumorphism border-none overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{getTitleFromId(category)}</h2>
            {isStarted && (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={toggleTextToSpeech} className="gap-2">
                  {textToSpeech ? (
                    <>
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span className="text-xs">TTS On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      <span className="text-xs">TTS Off</span>
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
            )}
          </div>

          {isStarted ? (
            <div className="space-y-6">
              <Progress value={progress} className="h-2" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                    <motion.div
                      className="bg-primary/10 p-2 rounded-full"
                      animate={
                        isTyping
                          ? {
                              scale: [1, 1.1, 1],
                              borderColor: ["rgba(0,195,255,0.2)", "rgba(0,195,255,0.6)", "rgba(0,195,255,0.2)"],
                            }
                          : {}
                      }
                      transition={{ duration: 1, repeat: isTyping ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      <Bot className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <div className="font-medium mb-1">Interviewer</div>
                      <div>{isTyping ? typingText : currentQuestion}</div>
                    </div>
                  </div>

                  {!feedback ? (
                    <div className="space-y-4">
                      <Textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[120px] resize-none"
                      />

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleRecording}
                          className={`rounded-full ${isRecording ? "bg-destructive/10" : ""}`}
                        >
                          {isRecording ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
                        </Button>

                        <Button
                          className="ml-auto gradient-button"
                          onClick={handleNextQuestion}
                          disabled={isProcessing || userResponse.trim() === "" || isTyping}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            <>
                              <SkipForward className="mr-2 h-4 w-4" />
                              {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Complete Interview"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 bg-primary/5 rounded-lg space-y-3"
                    >
                      <h3 className="font-bold">Feedback</h3>
                      <p>{feedback}</p>

                      {currentQuestionIndex < totalQuestions - 1 ? (
                        <Button
                          className="mt-2 gradient-button"
                          onClick={() => {
                            setCurrentQuestionIndex((prev) => prev + 1)
                            setUserResponse("")
                            setFeedback("")
                            simulateTyping(questions[currentQuestionIndex + 1])
                          }}
                        >
                          Continue to Next Question
                        </Button>
                      ) : (
                        <Button className="mt-2 gradient-button" onClick={() => (window.location.href = "/dashboard")}>
                          View Results in Dashboard
                        </Button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6 py-12"
            >
              <div className="mx-auto p-6 bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center">
                <Bot className="h-12 w-12 text-primary" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold">Ready to Begin Your Interview?</h3>
                <p className="text-muted-foreground">
                  Our AI interviewer will ask you {totalQuestions} questions about{" "}
                  {getTitleFromId(category).toLowerCase()}.
                  {hasResume && " The questions have been personalized based on your resume."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleStart} className="gradient-button">
                  Start Interview
                </Button>
                <Button size="lg" variant="outline" onClick={toggleTextToSpeech} className="glow-effect">
                  {textToSpeech ? (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Disable Voice
                    </>
                  ) : (
                    <>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Enable Voice
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

