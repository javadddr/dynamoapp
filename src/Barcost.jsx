import React from 'react';
import { Bar, BarChart,Tooltip,CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Adjust the import path according to your project
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'; // Adjust the import path according to your project

// Sample description (you can modify it as per your requirement)
export const description = "A mixed bar chart";

// Dummy config for chart, adjust based on your needs
const chartConfig = {
  visitors: {
    label: "Total Cost",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

// The main Barcost component
const Barcost = ({ data, theme, title }) => {
  return (
    
<div className="flex items-center">
    <div>
    <Card className={`w-[400px] ml-3 ${theme === 'dark' ? 'dark' : 'light'}  shadow-2xl`}>
      <CardHeader>
       
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className=" h-[190px]">
        <CartesianGrid vertical={false} />
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 0 }}
          >
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              tickMargin={0}
              axisLine={false}
             
            />
              <Tooltip
              cursor={false}
         
              content={
                <ChartTooltipContent
                  contentStyle={{ backgroundColor: "#e76e50", color: "#fff" }}
                 
                />
              }
            />
            <XAxis dataKey="visitors" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="visitors" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
  
    </Card>
    </div>
    </div>
  );
};

export default Barcost;
