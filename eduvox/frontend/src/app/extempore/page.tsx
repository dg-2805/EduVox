"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, RefreshCw, Play, Pause, BarChart, Home } from "lucide-react"
import { DebateNavbar } from "@/components/component/debate/debate-navbar"
import Link from "next/link"

const topics = [
  "The future of remote work",
  "Climate change solutions",
  "Artificial intelligence ethics",
  "Social media's impact on society",
  "Space exploration benefits",
  "Cryptocurrency's future",
  "Universal basic income",
  "Education system reform",
  "Healthcare innovation",
  "Sustainable urban development",
  "Digital privacy concerns",
  "Renewable energy transition",
  "Cultural diversity importance",
  "Global food security",
  "Mental health awareness",
]

export default function ExtemporePage() {
  const [selectedDuration, setSelectedDuration] = useState("60")
  const [currentTopic, setCurrentTopic] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState({
    fluency: 0,
    clarity: 0,
    structure: 0,
    fillerWords: 0,
    overallScore: 0,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const totalTime = Number.parseInt(selectedDuration)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const generateRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length)
    setCurrentTopic(topics[randomIndex])
  }

  const startSpeech = () => {
    generateRandomTopic()
    setTimeRemaining(Number.parseInt(selectedDuration))
    setProgress(0)
    setIsStarted(true)
    setIsPaused(false)
    setIsRecording(true)
    setShowResults(false)

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          endSpeech()
          return 0
        }

        const newTime = prev - 1
        const newProgress = ((totalTime - newTime) / totalTime) * 100
        setProgress(newProgress)
        return newTime
      })
    }, 1000)
  }

  const pauseSpeech = () => {
    setIsPaused(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const resumeSpeech = () => {
    setIsPaused(false)

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          endSpeech()
          return 0
        }

        const newTime = prev - 1
        const newProgress = ((totalTime - newTime) / totalTime) * 100
        setProgress(newProgress)
        return newTime
      })
    }, 1000)
  }

  const endSpeech = () => {
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Generate mock results
    const mockResults = {
      fluency: Math.floor(Math.random() * 30) + 70, // 70-100
      clarity: Math.floor(Math.random() * 30) + 70,
      structure: Math.floor(Math.random() * 30) + 70,
      fillerWords: Math.floor(Math.random() * 10) + 1, // 1-10
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
    }

    setResults(mockResults)
    setShowResults(true)
  }

  const resetSpeech = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsStarted(false)
    setIsPaused(false)
    setIsRecording(false)
    setTimeRemaining(0)
    setProgress(0)
    setShowResults(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DebateNavbar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 max-w-4xl mx-auto text-center"
        >
          <h1 className="text-3xl font-bold">Extempore Practice</h1>
          <p className="text-muted-foreground mt-2">
            Improve your impromptu speaking skills with AI-generated topics and real-time feedback.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!isStarted ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glassmorphism border-none">
                  <CardHeader>
                    <CardTitle className="text-center">Configure Your Practice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Speech Duration</label>
                      <Select onValueChange={setSelectedDuration} value={selectedDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 Seconds</SelectItem>
                          <SelectItem value="60">1 Minute</SelectItem>
                          <SelectItem value="120">2 Minutes</SelectItem>
                          <SelectItem value="180">3 Minutes</SelectItem>
                          <SelectItem value="300">5 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-medium">How it works</p>
                      <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                        <li>We'll generate a random topic for you to speak about</li>
                        <li>You'll have a few seconds to prepare</li>
                        <li>Speak clearly into your microphone for the duration</li>
                        <li>Our AI will analyze your speech and provide feedback</li>
                      </ol>
                    </div>

                    <Button onClick={startSpeech} className="w-full gradient-button">
                      Start Practice
                      <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glassmorphism border-none">
                  <CardHeader>
                    <CardTitle className="text-center">Speech Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Topic</p>
                      <p className="text-lg font-medium">{currentTopic}</p>
                    </div>

                    <div className="flex justify-center mb-6">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={Math.PI * 2 * 45}
                            initial={{ strokeDashoffset: Math.PI * 2 * 45 }}
                            animate={{
                              strokeDashoffset: Math.PI * 2 * 45 * (1 - results.overallScore / 100),
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{
                              transformOrigin: "center",
                              transform: "rotate(-90deg)",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-3xl font-bold"
                          >
                            {results.overallScore}
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fluency</span>
                          <span>{results.fluency}%</span>
                        </div>
                        <motion.div
                          className="h-2 bg-muted rounded-full overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${results.fluency}%` }}
                            transition={{ duration: 1, delay: 0.1 }}
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Clarity</span>
                          <span>{results.clarity}%</span>
                        </div>
                        <motion.div
                          className="h-2 bg-muted rounded-full overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${results.clarity}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Structure</span>
                          <span>{results.structure}%</span>
                        </div>
                        <motion.div
                          className="h-2 bg-muted rounded-full overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${results.structure}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Filler Words Used</span>
                          <span>{results.fillerWords}</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${i < results.fillerWords ? "bg-orange-500" : "bg-muted"}`}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 * i }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">AI Feedback</p>
                      <p className="text-sm text-muted-foreground">
                        Good job! Your speech was well-structured and clear. Try to reduce filler words like "um" and
                        "uh" for even better fluency. Practice pausing instead of using fillers when you need time to
                        think.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={resetSpeech} variant="outline" className="flex-1 glow-effect">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                      <Link href="/dashboard" className="flex-1">
                        <Button className="w-full gradient-button">
                          <BarChart className="mr-2 h-4 w-4" />
                          View Dashboard
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glassmorphism border-none">
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-bold mb-2"
                      >
                        {currentTopic}
                      </motion.div>
                      <p className="text-muted-foreground">Speak clearly about this topic until the timer ends</p>
                    </div>

                    <div className="flex justify-center items-center gap-4">
                      <div className="text-4xl font-mono font-bold text-primary">{formatTime(timeRemaining)}</div>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="flex justify-center gap-4">
                      {isPaused ? (
                        <Button onClick={resumeSpeech} size="lg" className="gradient-button">
                          <Play className="mr-2 h-5 w-5" />
                          Resume
                        </Button>
                      ) : (
                        <Button onClick={pauseSpeech} size="lg" variant="outline" className="glow-effect">
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </Button>
                      )}

                      <Button onClick={endSpeech} size="lg" variant="outline" className="glow-effect">
                        End Early
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <motion.div
                        animate={{
                          scale: isRecording ? [1, 1.1, 1] : 1,
                          opacity: isRecording ? [1, 0.7, 1] : 1,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                          repeatType: "loop",
                        }}
                        className={`p-4 rounded-full ${isRecording ? "bg-primary/20" : "bg-muted"}`}
                      >
                        {isRecording ? (
                          <Mic className="h-8 w-8 text-primary" />
                        ) : (
                          <MicOff className="h-8 w-8 text-muted-foreground" />
                        )}
                      </motion.div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      {isRecording ? "Recording in progress..." : "Recording paused"}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="container mx-auto px-4 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="glow-effect">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

