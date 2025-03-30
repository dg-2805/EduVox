"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

interface BarChartComponentProps {
  type: "debate" | "interview"
}

const debateData = [
  { name: "Logic", value: 85 },
  { name: "Evidence", value: 78 },
  { name: "Rebuttal", value: 92 },
  { name: "Clarity", value: 88 },
  { name: "Persuasion", value: 82 },
]

const interviewData = [
  { name: "Technical", value: 80 },
  { name: "Problem-Solving", value: 85 },
  { name: "Communication", value: 90 },
  { name: "Experience", value: 75 },
  { name: "Cultural Fit", value: 88 },
]

export function BarChartComponent({ type }: BarChartComponentProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center">Loading chart...</div>
  }

  const isDarkTheme = theme === "dark"
  const data = type === "debate" ? debateData : interviewData

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
            stroke={isDarkTheme ? "hsl(215 20.2% 65.1%)" : "hsl(215 16% 47%)"}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
            tickFormatter={(value: number) => `${value}%`}
            stroke={isDarkTheme ? "hsl(215 20.2% 65.1%)" : "hsl(215 16% 47%)"}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-sm font-medium">{payload[0].payload.name}</p>
                    <p className="text-sm text-muted-foreground">{`Score: ${payload[0].value}%`}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

