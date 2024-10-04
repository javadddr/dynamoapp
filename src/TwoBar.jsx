import React, { useState, useMemo } from 'react';
import { Bar, BarChart, XAxis, LabelList, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

function TwoBar({ theme, originalData, originalData1, chartConfig, chartConfig1, labels, labels1, titleo, titleo1 }) {
  // Transform the original data
  const transformedData = originalData.map(entry => {
    const date = entry.date;
    return labels.reduce((acc, label, index) => {
      acc[label] = entry.values[index];
      return acc;
    }, { date });
  });

  const transformedData1 = originalData1.map(entry => {
    const date = entry.date;
    return labels1.reduce((acc, label, index) => {
      acc[label] = entry.values[index];
      return acc;
    }, { date });
  });

  const [activeChart, setActiveChart] = useState("All Drivers");

  const customLabel = ({ x, y, width, height, value }) => {
    if (value < 10) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
      >
        {value.toFixed(0)}
      </text>
    );
  };

  const getFillColor = (label, config) => {
    return config[label]?.color || 'gray';
  };

  return (
    <Card className={`${theme === 'dark' ? 'dark' : 'light'}`}>
      <CardHeader className="flex flex-col max-h-20 items-stretch space-y-0 border-b p-0 sm:flex-row shadow-2xl">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-lg">Status of the {activeChart === "All Drivers" ? titleo : titleo1} (%) vs Date (Weekly)</CardTitle>
          <CardDescription>
            Showing average status for each category over time
          </CardDescription>
        </div>
        <div className="flex">
          <button
            key="All Drivers"
            data-active={activeChart === "All Drivers"}
            className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l ${activeChart === "All Drivers" ? 'bg-purple-500 text-slate-100' : ''} sm:border-l sm:border-t-0 sm:px-8 sm:py-6`}
            onClick={() => setActiveChart("All Drivers")}
          >
            <span className={`text-sm text-muted-foreground ${activeChart === "All Drivers" ? 'text-slate-100' : ''}`}>Drivers</span>
          </button>
          <button
            key="All Vehicles"
            data-active={activeChart === "All Vehicles"}
            className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l ${activeChart === "All Vehicles" ? 'bg-purple-500 text-slate-100' : ''} sm:border-l sm:border-t-0 sm:px-8 sm:py-6`}
            onClick={() => setActiveChart("All Vehicles")}
          >
            <span className={`text-sm text-muted-foreground ${activeChart === "All Vehicles" ? 'text-slate-100' : ''}`}>Vehicles</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 shadow-2xl">
        <ChartContainer
          config={activeChart === "All Drivers" ? chartConfig : chartConfig1}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={activeChart === "All Drivers" ? transformedData : transformedData1}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <Tooltip content={<ChartTooltipContent className="w-[150px]" />} />
            {activeChart === "All Drivers" && labels.map((label) => (
              <Bar key={label} stackId="a" dataKey={label} fill={getFillColor(label, chartConfig)}>
                <LabelList dataKey={label} position="inside" content={customLabel} />
              </Bar>
            ))}
            {activeChart === "All Vehicles" && labels1.map((label) => (
              <Bar key={label} stackId="a" dataKey={label} fill={getFillColor(label, chartConfig1)}>
                <LabelList dataKey={label} position="inside" content={customLabel} />
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default TwoBar;
