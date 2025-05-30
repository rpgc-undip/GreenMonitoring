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

export default function VehicleChartAndVideo({ chartData }) {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
       
        {/* Vehicle Area Chart */}
        {/*
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">
            Hourly Vehicle Count</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
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
               domain={['auto', 'auto']}
                label={{
                  value: "Vehicles",
                  angle: -90,
                  position: "insideLeft",
                  offset: -2,
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" align="center" layout="horizontal" />
              <Area
                type="monotone"
                dataKey="y1"
                stroke="#22C55E"
                fill="#22C55E20"
                strokeWidth={2}
                name="Total Vehicles"

              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
    */}

        {/* Live Video Stream */}
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          <h3 className="text-xl font-semibold mb-4">Live Vehicle Detection Stream</h3>
          <div className="w-full h-[240px] md:h-[300px] lg:h-[360px] xl:h-[400px]">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/live_stream?channel=UCuF8iQlh1JCDIhqMW3-SBnw&autoplay=1"
              title="Vehicle Detection Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
