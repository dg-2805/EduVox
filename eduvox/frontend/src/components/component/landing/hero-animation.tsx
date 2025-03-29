"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function HeroAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start the animation and set an interval to repeat it
    setIsAnimating(true)

    intervalRef.current = setInterval(() => {
      setIsAnimating(false)
      setTimeout(() => setIsAnimating(true), 500)
    }, 8000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Owl Mascot */}
        <motion.div
          className="relative"
          initial={{ y: 0 }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <div className="relative w-48 h-48">
            <div className="absolute w-48 h-48 rounded-full bg-primary/10 blur-md" />
            <svg
              width="192"
              height="192"
              viewBox="0 0 192 192"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              {/* Body */}
              <motion.ellipse
                cx="96"
                cy="110"
                rx="60"
                ry="70"
                fill="#00B8D9"
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />

              {/* Face */}
              <motion.circle
                cx="96"
                cy="85"
                r="45"
                fill="white"
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
              />

              {/* Eyes */}
              <g>
                <motion.circle
                  cx="78"
                  cy="80"
                  r="12"
                  fill="#222"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.circle
                  cx="114"
                  cy="80"
                  r="12"
                  fill="#222"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />

                {/* Eye shine */}
                <circle cx="82" cy="76" r="4" fill="white" />
                <circle cx="118" cy="76" r="4" fill="white" />
              </g>

              {/* Beak */}
              <motion.path
                d="M96 90 L86 105 H106 Z"
                fill="#FF9800"
                animate={{ rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              />

              {/* Graduation Cap */}
              <motion.g
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                <rect x="66" y="40" width="60" height="10" fill="#222" />
                <rect x="76" y="30" width="40" height="10" fill="#222" />
                <rect x="86" y="20" width="20" height="10" fill="#222" />
                <motion.path
                  d="M126 45 L146 55 L146 65 L126 55 Z"
                  fill="#222"
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
              </motion.g>

              {/* Wings */}
              <motion.path
                d="M36 110 Q 36 70, 76 90 Q 56 110, 36 110 Z"
                fill="#0097A7"
                animate={{ rotate: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
              <motion.path
                d="M156 110 Q 156 70, 116 90 Q 136 110, 156 110 Z"
                fill="#0097A7"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Speech Bubbles */}
        <motion.div
          className="absolute top-10 right-0 glassmorphism p-3 rounded-lg rounded-br-none max-w-[150px]"
          initial={{ opacity: 0, x: 30 }}
          animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-xs">Master public speaking with practice!</p>
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-0 glassmorphism p-3 rounded-lg rounded-bl-none max-w-[160px]"
          initial={{ opacity: 0, x: -30 }}
          animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <p className="text-xs">Improve your debate skills with AI feedback.</p>
        </motion.div>

        <motion.div
          className="absolute bottom-40 right-0 glassmorphism p-3 rounded-lg rounded-br-none max-w-[150px]"
          initial={{ opacity: 0, x: 30 }}
          animate={isAnimating ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.5, delay: 2.4 }}
        >
          <p className="text-xs">Ace your interviews with personalized practice.</p>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-5 left-10"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M2 6H22V18H2V6Z" fill="#00B8D9" opacity="0.5" />
            <path d="M4 8H20V16H4V8Z" fill="#00B8D9" opacity="0.8" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#9C6ADE" opacity="0.5" />
            <circle cx="12" cy="12" r="6" fill="#9C6ADE" opacity="0.8" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-40 right-5"
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 0.5,
          }}
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" fill="#00B8D9" opacity="0.7" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

