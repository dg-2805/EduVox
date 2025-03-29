"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DebateNavbar } from "@/components/component/debate/debate-navbar"
import { BellRing, Home, User, Moon, Sun, VolumeX, Volume2, Globe, Shield, Save } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark")
  const [notifications, setNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [textToSpeech, setTextToSpeech] = useState(true)
  const [language, setLanguage] = useState("english")
  const [privacy, setPrivacy] = useState("private")

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <DebateNavbar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your ArguMate experience</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="glassmorphism border-none">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how ArguMate looks on your device</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="font-medium">Theme</div>
                      <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="system" />
                          <Label htmlFor="system" className="cursor-pointer">
                            System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="animations" className="font-medium">
                          Animations
                        </Label>
                        <span className="text-sm text-muted-foreground">Enable animations and transitions</span>
                      </div>
                      <Switch id="animations" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="glassmorphism border-none">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your notification and application preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="notifications" className="font-medium flex items-center gap-2">
                          <BellRing className="h-4 w-4" />
                          Notifications
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Receive notifications about debates and interviews
                        </span>
                      </div>
                      <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="sound-effects" className="font-medium flex items-center gap-2">
                          {soundEffects ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          Sound Effects
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Play sounds for interactions and notifications
                        </span>
                      </div>
                      <Switch id="sound-effects" checked={soundEffects} onCheckedChange={setSoundEffects} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="text-to-speech" className="font-medium flex items-center gap-2">
                          {textToSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          Text-to-Speech
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Read AI responses aloud during debates and interviews
                        </span>
                      </div>
                      <Switch id="text-to-speech" checked={textToSpeech} onCheckedChange={setTextToSpeech} />
                    </div>

                    <div className="space-y-4">
                      <div className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Language</span>
                      </div>
                      <RadioGroup value={language} onValueChange={setLanguage} className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="english" id="english" />
                          <Label htmlFor="english" className="cursor-pointer">
                            English
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="spanish" id="spanish" />
                          <Label htmlFor="spanish" className="cursor-pointer">
                            Spanish
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="french" id="french" />
                          <Label htmlFor="french" className="cursor-pointer">
                            French
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="german" id="german" />
                          <Label htmlFor="german" className="cursor-pointer">
                            German
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="privacy">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="glassmorphism border-none">
                  <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Manage your data and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Data Privacy</span>
                      </div>
                      <RadioGroup value={privacy} onValueChange={setPrivacy} className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private" className="cursor-pointer">
                            Private - Don't store my debate history
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="store" id="store" />
                          <Label htmlFor="store" className="cursor-pointer">
                            Store - Keep my history for personalized improvements
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anonymous" id="anonymous" />
                          <Label htmlFor="anonymous" className="cursor-pointer">
                            Anonymous - Contribute anonymized data for AI training
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="cookies" className="font-medium">
                          Cookies
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Allow cookies for improved user experience
                        </span>
                      </div>
                      <Switch id="cookies" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="analytics" className="font-medium">
                          Analytics
                        </Label>
                        <span className="text-sm text-muted-foreground">Share usage data to help improve ArguMate</span>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>

                    <Button variant="outline" className="w-full">
                      Download My Data
                    </Button>

                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      <div className="container mx-auto px-4 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

