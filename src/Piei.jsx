import React from 'react';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Legend } from "recharts"; // Import Legend
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function Piei({ theme, chartData, chartConfig, title }) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [chartData]);

  return (
    <div className={`w-[100%] md:w-[97%] ml-2 font-sans mt-4 ${theme.theme === 'dark' ? 'dark' : 'light'}`}>
      <div>
        <Card className={`flex shadow-xl flex-col ${theme === 'dark' ? 'dark' : 'light'}`}>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[750px]"
            >
              <CardDescription className="pt-4">{title}</CardDescription>
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={chartData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={50}
                  strokeWidth={5}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) / 2;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-bold"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
                {/* Add the Legend Here */}
                <Legend 
                  align="center" 
                  verticalAlign="bottom" 
                  content={<CustomLegend />} // Optional: For custom content
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm h-[60px]">
            {/* Add additional footer content if needed */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Example of a Custom Legend (Optional)
function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2 mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-1">
          <span style={{ backgroundColor: entry.color }} className="w-4 h-4 inline-block"></span>
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default Piei;
