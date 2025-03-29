"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { GlowingEffect } from "@/components/ui/glowing-effect"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="relative rounded-xl h-full"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className="relative p-2 rounded-xl border h-full">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="p-6 rounded-xl glassmorphism h-full card-hover">
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="mb-4 p-4 rounded-full bg-primary/10 pulse"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 20px rgba(0, 195, 255, 0.5)",
              }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
            <h3 className="text-xl font-bold mb-2 gradient-text">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}