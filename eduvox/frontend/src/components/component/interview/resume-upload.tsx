"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileUp, X, Check, File, Loader2 } from "lucide-react"

interface ResumeUploadProps {
  onUploadComplete: () => void
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const isValidFileType = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    return validTypes.includes(file.type)
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      setIsComplete(true)
      onUploadComplete()
    }, 2000)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setIsComplete(false)
  }

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || ""
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: isDragging ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
            <FileUp className="h-10 w-10 text-muted-foreground" />
          </motion.div>

          <div className="text-center">
            <p className="text-sm font-medium">Drag and drop your resume here, or</p>
            <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOC, DOCX (Max 5MB)</p>
          </div>

          <Button type="button" variant="outline" className="glow-effect" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
        </div>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-secondary p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileExtension(file.name)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isComplete ? (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-500">Uploaded</span>
                </div>
              ) : isUploading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <>
                  <Button size="sm" className="gradient-button" onClick={handleUpload}>
                    Upload
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

