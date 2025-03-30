"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

const data = [
  { date: "Jan", debateScore: 65, interviewScore: 58 },
  { date: "Feb", debateScore: 68, interviewScore: 62 },
  { date: "Mar", debateScore: 70, interviewScore: 65 },
  { date: "Apr", debateScore: 72, interviewScore: 70 },
  { date: "May", debateScore: 75, interviewScore: 72 },
  { date: "Jun", debateScore: 80, interviewScore: 75 },
  { date: "Jul", debateScore: 82, interviewScore: 78 },
  { date: "Aug", debateScore: 85, interviewScore: 80 },
  { date: "Sep", debateScore: 87, interviewScore: 82 },
]

export function LineChart() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center">Loading chart...</div>
  }

  const isDarkTheme = theme === "dark"

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
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
            dataKey="date"
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
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-sm font-medium">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.name} className="text-sm text-muted-foreground">
                        {entry.name}: {entry.value}%
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="debateScore"
            name="Debate"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="interviewScore"
            name="Interview"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--accent))" }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

