import React from 'react';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";



export function Piei2({ theme, chartData,chartConfig,title }) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);
 
  return (
    <div  className={`w-[80%] -mt-5 p-0 font-sans ${
      theme.theme === 'dark' ? 'dark' : 'light'
    }`}>
      <div >
    <Card className={`flex mt-0 p-0 border-0 flex-col ${
      theme === 'dark' ? 'dark' : 'light'
    }`}>
  
      <CardContent className={`flex-1 pb-0 p-0 m-0 ${
      theme === 'dark' ? 'bg-slate-800' : 'light'
    } `}>
        <ChartContainer
          config={chartConfig}
          className="mx-auto  aspect-square  max-h-[280px]"
        >
          
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent  />}
              
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
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
                    className="font-bold "
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
                        className="fill-foreground text-3xl  font-bold"
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
          </PieChart>
        </ChartContainer>
      </CardContent>
   
    </Card>
    </div>
    </div>
  );
}
export default Piei2;
