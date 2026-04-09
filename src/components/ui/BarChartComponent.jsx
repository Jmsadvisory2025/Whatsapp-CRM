import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data, height = 460 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => ` ${value}`}
            interval={0}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, "Inquiries"]}
            labelFormatter={(label) => ` ${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;