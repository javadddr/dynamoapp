import React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
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
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  cost: {
    label: "cost",
    color: "#e76e50",
  },
};

const ThreeBar = ({ data,title, theme }) => {
  const chartData = data;

  return (
    <Card className={`w-[40%] ${theme === 'dark' ? 'dark' : 'light'} shadow-2xl`}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="cost" hide />
            <YAxis
              dataKey="name"
              type="category"
             
              tickLine={false}
              tickMargin={0}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 4)}
            />
            <Tooltip
              cursor={false}
         
              content={
                <ChartTooltipContent
                  contentStyle={{ backgroundColor: "#e76e50", color: "#fff" }}
                 
                />
              }
            />
            <Bar dataKey="cost" fill="#e76e50" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ThreeBar;
