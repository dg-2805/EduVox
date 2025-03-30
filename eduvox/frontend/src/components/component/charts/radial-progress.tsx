"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface RadialProgressProps {
  value: number
  size?: number
  strokeWidth?: number
}

export function RadialProgress({ value, size = 120, strokeWidth = 8 }: RadialProgressProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDarkTheme ? "hsl(var(--muted))" : "hsl(var(--muted))"}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-2xl font-bold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {value}%
        </motion.div>
      </div>
    </div>
  )
}

