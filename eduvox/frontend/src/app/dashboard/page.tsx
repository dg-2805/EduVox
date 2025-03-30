"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  BarChart,
  ArrowUpRight,
} from "lucide-react"
import { DebateNavbar } from "@/components/component/debate/debate-navbar"
import { LineChart } from "@/components/component/charts/line-chart"
import { BarChartComponent } from "@/components/component/charts/bar-chart"
import { RadialProgress } from "@/components/component/charts/radial-progress"
import { RecentActivityCard } from "@/components/component/recent-activity-card"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <DebateNavbar />

      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and view insights from your recent debates and interviews.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glassmorphism border-none h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Debate Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    8% increase
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="glassmorphism border-none h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    5% increase
                  </span>
                  from previous average
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="glassmorphism border-none h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Next Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">Mock Interview</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tomorrow, 2:00 PM
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card className="glassmorphism border-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Progress Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="glassmorphism border-none h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <RadialProgress value={78} />
                <div className="mt-4 text-center">
                  <div className="text-sm font-medium">Overall Score</div>
                  <div className="text-xs text-muted-foreground">Top 22% of all users</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="glassmorphism border-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RecentActivityCard title="Climate Change Debate" type="debate" score={92} date="2 days ago" />
                <RecentActivityCard title="Tech Interview Practice" type="interview" score={85} date="5 days ago" />
                <RecentActivityCard title="Education Reform Debate" type="debate" score={78} date="1 week ago" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="md:col-span-2"
          >
            <Card className="glassmorphism border-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  Skills Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="debate">
                  <TabsList className="mb-4">
                    <TabsTrigger value="debate">Debate Skills</TabsTrigger>
                    <TabsTrigger value="interview">Interview Skills</TabsTrigger>
                  </TabsList>
                  <TabsContent value="debate">
                    <BarChartComponent type="debate" />
                  </TabsContent>
                  <TabsContent value="interview">
                    <BarChartComponent type="interview" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

