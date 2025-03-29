"use client"

import Link from "next/link"
import { Brain, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/component/theme-toggle"
import { motion } from "framer-motion"

export function DebateNavbar() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-3">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Brain className="h-6 w-6 text-primary" />
          </motion.div>
          <motion.h1
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-300 neon-text"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            EduVox
          </motion.h1>
        </Link>

        <motion.div
          className="flex items-center gap-4"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/interview" className="text-sm font-medium hover:text-primary transition-colors">
              Interview
            </Link>
            <Link href="/extempore" className="text-sm font-medium hover:text-primary transition-colors">
              Extempore
            </Link>
            <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="rounded-full glow-effect">
            <User className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </header>
  )
}

