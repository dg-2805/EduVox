"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Mic,
  MicOff,
  Clock,
  Home,
  ArrowRight,
  Lightbulb,
  HelpCircle,
  Volume2,
  VolumeX,
} from "lucide-react"
import Link from "next/link"
import { DebateNavbar } from "@/components/component/debate/debate-navbar"
import { DebateBubble } from "@/components/component/debate/debate-bubble"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const topics = [
  "Climate Change Solutions",
  "Universal Basic Income",
  "Artificial Intelligence Regulation",
  "Social Media's Impact on Democracy",
  "Education System Reform",
  "Healthcare Models",
  "Space Exploration Priorities",
  "Cryptocurrency Regulation",
  "Genetic Engineering Ethics",
]

export default function DebatePage() {
  const [activeTab, setActiveTab] = useState("ai-practice")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [debate, setDebate] = useState<{ role: "user" | "ai"; message: string; timestamp: Date }[]>([])
  const [debateStarted, setDebateStarted] = useState(false)
  const [timer, setTimer] = useState(120)
  const [selectedTimer, setSelectedTimer] = useState("120")
  const [rounds, setRounds] = useState("3")
  const [currentRound, setCurrentRound] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [stance, setStance] = useState("for")

  const handleSendMessage = () => {
    if (!userMessage.trim()) return

    const newMessage = {
      role: "user" as const,
      message: userMessage,
      timestamp: new Date(),
    }

    setDebate([...debate, newMessage])
    setUserMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Have you considered the economic impact of this proposal on developing nations?",
        "That's an interesting perspective, but what evidence supports your claim?",
        "While your point has merit, there are significant implementation challenges to consider.",
        "Historical precedents suggest a different outcome than what you're proposing.",
        "The ethical implications of this approach require deeper examination.",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      setDebate((current) => [
        ...current,
        {
          role: "ai",
          message: randomResponse,
          timestamp: new Date(),
        },
      ])
    }, 1500)
  }

  const startDebate = () => {
    if (!selectedTopic) return

    setDebateStarted(true)
    setCurrentRound(1)
    setTimer(Number.parseInt(selectedTimer))
    setDebate([
      {
        role: "ai",
        message: `Let's debate about ${selectedTopic}. This is round 1 of ${rounds}. Please share your opening statement.`,
        timestamp: new Date(),
      },
    ])

    // Start timer countdown if timer is enabled
    if (selectedTimer !== "0") {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalId)
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }
  }

  const resetDebate = () => {
    setDebateStarted(false)
    setDebate([])
    setTimer(Number.parseInt(selectedTimer))
    setSelectedTopic("")
    setCurrentRound(1)
    setShowHint(false)
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const showHintBubble = () => {
    setShowHint(true)

    // Hide hint after 10 seconds
    setTimeout(() => {
      setShowHint(false)
    }, 10000)
  }

  const nextRound = () => {
    if (currentRound < Number.parseInt(rounds)) {
      setCurrentRound((prev) => prev + 1)
      setTimer(Number.parseInt(selectedTimer))

      setDebate((current) => [
        ...current,
        {
          role: "ai",
          message: `Round ${currentRound} completed. Moving to round ${currentRound + 1} of ${rounds}. Please continue the debate.`,
          timestamp: new Date(),
        },
      ])

      // Restart timer if it's enabled
      if (selectedTimer !== "0") {
        const intervalId = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(intervalId)
              return 0
            }
            return prevTimer - 1
          })
        }, 1000)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DebateNavbar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ai-practice">AI Practice Session</TabsTrigger>
              <TabsTrigger value="live-debate">Live Debate Mode</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="ai-practice" className="space-y-6">
                <motion.div
                  key="ai-practice"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-none neumorphism">
                    <CardContent className="p-6">
                      {!debateStarted ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Configure Your Debate</h2>
                            <p className="text-muted-foreground">Choose a topic and customize your debate settings.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-sm font-medium">Select a Topic</label>
                              <Textarea
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                placeholder="Type your topic here..."
                                className="resize-none"
                                rows={2}
                              />
                            </div>

                            <div className="space-y-4">
                              <label className="text-sm font-medium">Number of Rounds</label>
                              <Select onValueChange={setRounds} value={rounds}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rounds" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 Rounds</SelectItem>
                                  <SelectItem value="4">4 Rounds</SelectItem>
                                  <SelectItem value="5">5 Rounds</SelectItem>
                                  <SelectItem value="6">6 Rounds</SelectItem>
                                  <SelectItem value="7">7 Rounds</SelectItem>
                                  <SelectItem value="8">8 Rounds</SelectItem>
                                  <SelectItem value="9">9 Rounds</SelectItem>
                                  <SelectItem value="10">10 Rounds</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-4">
                              <label className="text-sm font-medium">Stance</label>
                              <div className="flex space-x-4">
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="for"
                                    name="stance"
                                    value="for"
                                    checked={stance === "for"}
                                    onChange={() => setStance("for")}
                                  />
                                  <label htmlFor="for" className="ml-2">For</label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="against"
                                    name="stance"
                                    value="against"
                                    checked={stance === "against"}
                                    onChange={() => setStance("against")}
                                  />
                                  <label htmlFor="against" className="ml-2">Against</label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-sm font-medium">Communication Method</label>
                              <div className="flex space-x-4">
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="voice"
                                    name="communication"
                                    value="voice"
                                    checked={isSpeaking}
                                    onChange={() => setIsSpeaking(true)}
                                  />
                                  <label htmlFor="voice" className="ml-2">Voice</label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="text"
                                    name="communication"
                                    value="text"
                                    checked={!isSpeaking}
                                    onChange={() => setIsSpeaking(false)}
                                  />
                                  <label htmlFor="text" className="ml-2">Text</label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button onClick={startDebate} disabled={!selectedTopic} className="w-full gradient-button">
                            Start Debate
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h2 className="text-xl font-bold">{selectedTopic}</h2>
                              <div className="text-sm text-muted-foreground">
                                Round {currentRound} of {rounds}
                              </div>
                            </div>
                            {selectedTimer !== "0" && (
                              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="text-sm font-mono">{formatTime(timer)}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
                            <AnimatePresence>
                              {debate.map((message, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <DebateBubble
                                    role={message.role}
                                    message={message.message}
                                    timestamp={message.timestamp}
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          <div className="relative mt-4">
                            <Textarea
                              value={userMessage}
                              onChange={(e) => setUserMessage(e.target.value)}
                              placeholder="Type your argument here..."
                              className="pr-20 resize-none"
                              rows={3}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                            />
                            <div className="absolute right-2 bottom-2 flex gap-2">
                              <Button variant="ghost" size="icon" onClick={toggleSpeech} className="rounded-full">
                                {isSpeaking ? (
                                  <MicOff className="h-4 w-4 text-destructive" />
                                ) : (
                                  <Mic className="h-4 w-4" />
                                )}
                              </Button>
                              <Button size="sm" onClick={handleSendMessage} className="rounded-full gradient-button">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={resetDebate} className="text-xs">
                              Reset Debate
                            </Button>

                            {currentRound < Number.parseInt(rounds) && (
                              <Button variant="outline" size="sm" onClick={nextRound} className="text-xs">
                                Next Round
                              </Button>
                            )}
                          </div>

                          {/* Floating Hint Button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg z-10"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={showHintBubble}
                                >
                                  <HelpCircle className="h-6 w-6" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Get a hint</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* AI Hint */}
                          <AnimatePresence>
                            {showHint && (
                              <motion.div
                                className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2"
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium mb-1">Debate Hint</p>
                                  <p className="text-sm text-muted-foreground">
                                    Try using the "PREP" framework: Point, Reason, Example, Point (restated). This
                                    structure helps organize your argument clearly.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="live-debate">
                <motion.div
                  key="live-debate"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center space-y-6 py-12"
                >
                  <div className="glassmorphism p-8 rounded-xl text-center max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">Live Debate Mode</h2>
                    <p className="text-muted-foreground mb-6">
                      Connect with other users and debate in real-time. This feature allows you to participate in
                      moderated discussions with users across the platform.
                    </p>
                    <Button size="lg" className="gradient-button">
                      Coming Soon
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
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

