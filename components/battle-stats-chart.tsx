"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { BattleHistoryPoint } from "@/lib/battle-engine"

interface BattleStatsChartProps {
  history: BattleHistoryPoint[]
}

export function BattleStatsChart({ history }: BattleStatsChartProps) {
  return (
    <Card className="p-3 sm:p-4 bg-black/80 backdrop-blur border-2 border-cyan-500/50">
      <h3 className="text-sm sm:text-base font-bold text-center mb-2 sm:mb-3 text-cyan-400 uppercase tracking-wider">
        Battle Statistics
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0ea5e9" opacity={0.2} />
          <XAxis
            dataKey="time"
            stroke="#06b6d4"
            tick={{ fill: "#06b6d4", fontSize: 12 }}
            label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#06b6d4" }}
          />
          <YAxis
            stroke="#06b6d4"
            tick={{ fill: "#06b6d4", fontSize: 12 }}
            label={{ value: "HP", angle: -90, position: "insideLeft", fill: "#06b6d4" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#000000",
              border: "2px solid #06b6d4",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#06b6d4",
            }}
            labelStyle={{ color: "#06b6d4" }}
            itemStyle={{ color: "#06b6d4" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#06b6d4" }}
            iconType="line"
            formatter={(value) => <span style={{ color: "#06b6d4" }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="playerHP"
            stroke="#06b6d4"
            strokeWidth={3}
            name="Your HP"
            dot={false}
            activeDot={{ r: 5, fill: "#06b6d4" }}
          />
          <Line
            type="monotone"
            dataKey="enemyHP"
            stroke="#ec4899"
            strokeWidth={3}
            name="Enemy HP"
            dot={false}
            activeDot={{ r: 5, fill: "#ec4899" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
