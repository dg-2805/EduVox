"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Bot, MessageSquare } from "lucide-react"

const ANIMATION_INTERVAL = 8000
const ANIMATION_RESET_DELAY = 500

export default function HeroAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize static values
  const centralAnimation = useMemo(() => ({
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 rgba(124, 58, 237, 0)",
      "0 0 20px rgba(124, 58, 237, 0.5)",
      "0 0 0 rgba(124, 58, 237, 0)",
    ],
  }), [])

  const pathVariants = useMemo(() => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 0.5 },
  }), [])

  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true)
      setIsVisible(true)
    }

    const resetAnimation = () => {
      setIsAnimating(false)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, ANIMATION_RESET_DELAY)
    }

    // Initial animation
    startAnimation()

    // Set up interval for repeating animation
    intervalRef.current = setInterval(() => {
      resetAnimation()
    }, ANIMATION_INTERVAL)

    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Central brain hub */}
        <motion.div
          key="central-hub"
          className="p-8 rounded-full bg-secondary neumorphism flex items-center justify-center relative"
          animate={centralAnimation}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <MessageSquare className="w-12 h-12 text-primary" />
        </motion.div>

        <AnimatePresence mode="wait">
          {isVisible && (
            <>
              {/* User bubbles */}
              <motion.div
                key="user-bubble-1"
                className="absolute top-4 left-4 glassmorphism p-3 rounded-lg rounded-bl-none max-w-[150px] sm:left-6 sm:top-8"
                initial={{ opacity: 0, x: -30 }}
                animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">You</span>
                </div>
                <p className="text-xs">Climate change is a serious threat.</p>
              </motion.div>

              <motion.div
                key="user-bubble-2"
                className="absolute bottom-4 left-4 glassmorphism p-3 rounded-lg rounded-bl-none max-w-[160px] sm:left-6 sm:bottom-8"
                initial={{ opacity: 0, x: -30 }}
                animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">You</span>
                </div>
                <p className="text-xs">We need to reduce carbon emissions immediately.</p>
              </motion.div>

              {/* AI bubbles */}
              <motion.div
                key="ai-bubble-1"
                className="absolute top-4 right-4 glassmorphism p-3 rounded-lg rounded-br-none max-w-[170px] sm:right-6 sm:top-8"
                initial={{ opacity: 0, x: 30 }}
                animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">ArguMate</span>
                </div>
                <p className="text-xs">What evidence supports the economic impact of your proposal?</p>
              </motion.div>

              <motion.div
                key="ai-bubble-2"
                className="absolute bottom-4 right-4 glassmorphism p-3 rounded-lg rounded-br-none max-w-[150px] sm:right-6 sm:bottom-8"
                initial={{ opacity: 0, x: 30 }}
                animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 2.4 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">ArguMate</span>
                </div>
                <p className="text-xs">Have you considered the impact on developing economies?</p>
              </motion.div>

              {/* Connection lines */}
              <svg key="connection-lines" className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                <motion.path
                  key="path-1"
                  d="M160,200 L60,60"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  variants={pathVariants}
                  initial="hidden"
                  animate={isAnimating ? "visible" : "hidden"}
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                <motion.path
                  key="path-2"
                  d="M240,200 L340,60"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  variants={pathVariants}
                  initial="hidden"
                  animate={isAnimating ? "visible" : "hidden"}
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 0.7 }}
                />
                <motion.path
                  key="path-3"
                  d="M160,200 L60,340"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  variants={pathVariants}
                  initial="hidden"
                  animate={isAnimating ? "visible" : "hidden"}
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 1.7 }}
                />
                <motion.path
                  key="path-4"
                  d="M240,200 L340,340"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  variants={pathVariants}
                  initial="hidden"
                  animate={isAnimating ? "visible" : "hidden"}
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 2.3 }}
                />
              </svg>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

