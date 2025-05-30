import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function CO2Chart({ dailyChartData }) {
  return (
    <section className="mt-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Hourly CO₂ Outdoor Level</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{
                value: "Time (Hour)",
                position: "insideTop",
                offset: 22,
              }}
            />
            <YAxis
              label={{
                value: "CO₂ Level (ppm)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" align="center" layout="horizontal" />
            <Area
              type="basis"
              dataKey="y1"
              stroke="#4F46E5"
              fill="#4F46E520"
              strokeWidth={2}
              name="Level 1"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="basis"
              dataKey="y2"
              stroke="#EF4444"
              fill="#EF444420"
              strokeWidth={2}
              name="Level 2"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="basis"
              dataKey="y3"
              stroke="#F59E0B"
              fill="#F59E0B20"
              strokeWidth={2}
              name="Level 3"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="basis"
              dataKey="y4"
              stroke="#10B981"
              fill="#10B98120"
              strokeWidth={2}
              name="Level 4"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
