"use client";

import * as React from "react";
import { Area, AreaChart, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";



const chartConfig = {
  desktop: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
};

export function Lini2({theme,chartData}) {
  console.log(chartData);
  return (
    <div className="flex items-center">
      <div>
        <Card className={`w-[500px] ${theme}`}>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{ left: 0, right: 12, top: 20, bottom: 0 }} // Adjust margin as needed
              >
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tick={false} // This will hide the Y-axis ticks (numbers)
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />

                <defs>
                  <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>

                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="url(#fillDesktop)"
                  fillOpacity={0.6}
                  stroke="var(--color-desktop)"
                  stackId="a"
                  label={({ x, y, value }) => (
                    <text x={x} y={y} fill="var(--color-desktop)" fontSize={12} textAnchor="middle" dy={-10}>
                      {value}
                    </text>
                  )}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Lini2;
