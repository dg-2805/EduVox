"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Home } from "lucide-react";
import Link from "next/link";

export default function InterviewPage() {
  const [jobProfile, setJobProfile] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobProfile || !difficulty || !resumeFile) {
      alert("Please fill out all fields and upload a resume.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", resumeFile);
    formData.append(
      "data",
      JSON.stringify({
        job_profile: jobProfile,
        difficulty: difficulty,
      })
    );

    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setResponse(result.report);
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 max-w-4xl mx-auto text-center"
        >
          <h1 className="text-3xl font-bold">AI Interview Practice</h1>
          <p className="text-muted-foreground mt-2">
            Prepare for your next interview with our AI-powered mock interviews.
            Fill out the form below to get started.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Card className="glassmorphism border-none">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="jobProfile">Job Profile</Label>
                  <Input
                    id="jobProfile"
                    type="text"
                    placeholder="Enter the job profile (e.g., Software Engineer)"
                    value={jobProfile}
                    onChange={(e) => setJobProfile(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    onValueChange={(value) => setDifficulty(value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Easy)</SelectItem>
                      <SelectItem value="2">2 (Medium)</SelectItem>
                      <SelectItem value="3">3 (Hard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label htmlFor="resume">Upload Resume</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gradient-button"
                  >
                    {isSubmitting ? "Submitting..." : "Start Interview"}
                  </Button>
                </div>
              </form>

              {response && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold">Interview Report</h2>
                  <p className="text-muted-foreground mt-2">{response}</p>
                </div>
              )}
            </CardContent>
          </Card>
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
  );
}
