"use client"

import { motion } from "framer-motion"
import { FileText, MessageSquare } from "lucide-react"

interface RecentActivityCardProps {
  title: string
  type: "debate" | "interview"
  score: number
  date: string
}

export function RecentActivityCard({ title, type, score, date }: RecentActivityCardProps) {
  return (
    <motion.div
      className="p-3 rounded-lg neumorphism flex items-center gap-3"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-2 bg-primary/10 rounded-full">
        {type === "debate" ? (
          <MessageSquare className="h-4 w-4 text-primary" />
        ) : (
          <FileText className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">{score}%</div>
        <div className="text-xs text-muted-foreground">Score</div>
      </div>
    </motion.div>
  )
}

