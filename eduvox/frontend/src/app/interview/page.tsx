"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DebateNavbar } from "@/components/component/debate/debate-navbar"
import { InterviewCard } from "@/components/component/interview/interview-card"
import { ResumeUpload } from "@/components/component/interview/resume-upload"
import { Briefcase, Code, Building, Users, GraduationCap, Home, FileText } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "tech",
    title: "Technical",
    icon: <Code className="h-10 w-10 text-primary" />,
    description: "Software engineering, data science, and IT roles",
  },
  {
    id: "business",
    title: "Business",
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    description: "Management, finance, and strategy positions",
  },
  {
    id: "corporate",
    title: "Corporate",
    icon: <Building className="h-10 w-10 text-primary" />,
    description: "Large organization and enterprise roles",
  },
  {
    id: "hr",
    title: "HR & Behavioral",
    icon: <Users className="h-10 w-10 text-primary" />,
    description: "Soft skills and personality assessment",
  },
  {
    id: "academic",
    title: "Academic",
    icon: <GraduationCap className="h-10 w-10 text-primary" />,
    description: "Research, teaching, and education roles",
  },
]

export default function InterviewPage() {
  const [selectedTab, setSelectedTab] = useState("categories")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [resumeUploaded, setResumeUploaded] = useState(false)

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id)
    if (resumeUploaded) {
      setSelectedTab("simulation")
    } else {
      setSelectedTab("resume")
    }
  }

  const handleResumeUploaded = () => {
    setResumeUploaded(true)
    setSelectedTab("simulation")
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
          <h1 className="text-3xl font-bold">AI Interview Practice</h1>
          <p className="text-muted-foreground mt-2">
            Prepare for your next interview with our AI-powered mock interviews. Choose a category to get started.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="categories">Select Category</TabsTrigger>
              <TabsTrigger value="resume" disabled={!selectedCategory}>
                Upload Resume
              </TabsTrigger>
              <TabsTrigger value="simulation" disabled={!selectedCategory || !resumeUploaded}>
                Interview Simulation
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="categories">
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          className="glassmorphism border-none h-full cursor-pointer overflow-hidden"
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <CardContent className="p-6">
                            <motion.div
                              className="flex flex-col items-center text-center"
                              whileHover={{ y: -5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="mb-4 p-4 rounded-full bg-primary/10">{category.icon}</div>
                              <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                              <p className="text-muted-foreground text-sm">{category.description}</p>
                              <Button className="mt-4 gradient-button">Select Category</Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="resume">
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glassmorphism border-none">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Upload Your Resume</h2>
                        <p className="text-muted-foreground mt-2">
                          Our AI will analyze your resume to personalize the interview questions. This step is optional
                          but recommended for a more tailored experience.
                        </p>
                      </div>

                      <ResumeUpload onUploadComplete={handleResumeUploaded} />

                      <div className="mt-6 flex justify-end">
                        <Button variant="outline" className="glow-effect" onClick={() => setSelectedTab("simulation")}>
                          Skip this step
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="simulation">
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InterviewCard category={selectedCategory} hasResume={resumeUploaded} />
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

