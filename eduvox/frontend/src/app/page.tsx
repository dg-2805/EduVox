"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, MessageSquare, Play, Mic } from "lucide-react"
import { FeatureCard } from "@/components/component/landing/feature-card"
import { AnimatedText } from "@/components/component/landing/animated-text"
import { ThemeToggle } from "@/components/component/theme-toggle"
import HeroAnimation from "@/components/component/landing/hero-animation"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-300 neon-text"
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
              <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </nav>
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="outline" size="sm" className="glow-effect">
                Login
              </Button>
            </Link>
            <Link href="/auth?signup=true" className="hidden sm:block">
              <Button size="sm" className="gradient-button">
                Sign up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-6 md:py-24 relative overflow-hidden hero-gradient">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              className="md:w-1/2 z-10"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Master the art of <AnimatedText text="communication" className="text-primary neon-text" /> with AI
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                Practice debates, interviews, and public speaking with our AI-powered platform. Get real-time feedback
                and improve your communication skills.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/debate">
                  <Button size="lg" className="rounded-full gradient-button">
                    <Play className="mr-2 h-4 w-4" />
                    Start Debate
                  </Button>
                </Link>
                <Link href="/interview">
                  <Button size="lg" variant="outline" className="rounded-full glow-effect">
                    Practice Interview
                  </Button>
                </Link>
                <Link href="/extempore">
                  <Button size="lg" variant="outline" className="rounded-full glow-effect">
                    <Mic className="mr-2 h-4 w-4" />
                    Extempore
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeroAnimation />
            </motion.div>
          </div>

          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                EduVox combines cutting-edge AI with interactive learning to help you become a more effective
                communicator.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<MessageSquare className="h-10 w-10 text-primary" />}
                title="AI-Powered Debates"
                description="Practice with our AI that generates realistic counterarguments based on your topic."
                delay={0.1}
              />
              <FeatureCard
                icon={<Brain className="h-10 w-10 text-primary" />}
                title="Interview Simulation"
                description="Prepare for job interviews with customized questions from different industries."
                delay={0.2}
              />
              <FeatureCard
                icon={<Mic className="h-10 w-10 text-primary" />}
                title="Extempore Practice"
                description="Improve your impromptu speaking skills with AI-generated topics and real-time feedback."
                delay={0.3}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold">EduVox</span>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              © {new Date().getFullYear()} EduVox. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

