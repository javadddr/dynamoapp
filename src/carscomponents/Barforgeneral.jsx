import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A bar chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Total costs",
    color: "hsl(var(--chart-1))",
  },
};

function Barforgeneral({theme,chartData,title}) {
  return (
    <div className="flex items-center ">
    <div>
    <Card className={`w-[400px] ml-3 ${theme === 'dark' ? 'dark' : 'light'}  shadow-2xl`}>
      <CardHeader>
      
        <CardDescription>{title} cost vs date</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}  className=" h-[190px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
             
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
  
    </Card>
    </div>
    </div>
  );
}

export default Barforgeneral;
