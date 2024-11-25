import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend, LabelList } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from '@/components/ui/chart';



const Bari = ({ chartData,theme,lan }) => {
  const chartConfig = {
    Vehicles: {
      label: lan==="US"?"Vehicles":"Fahrzeuge",
      color: 'hsl(var(--chart-1))',
    },
    Drivers: {
      label: lan==="US"?"Drivers":"Fahrer",
      color: 'hsl(var(--chart-2))',
    },
  };
  return (
    <Card className={`w-[40%] ml-[6%] mt-5 shadow-2xl ${theme === 'dark' ? 'dark' : 'light'}  shadow-2xl`}>
      <CardHeader>
       
        <CardDescription>{lan==="US"?"Number of Drivers and Vehicles vs Areas":"Anzahl der Fahrer und Fahrzeuge nach Gebieten"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="area"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <Tooltip     content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Bar
              dataKey="Vehicles"
              stackId="a"
              fill="var(--color-Vehicles)"
              radius={[0, 0, 4, 4]}
            >
              <LabelList dataKey="Vehicles" position="inside" style={{ fill: 'white' }} />
            </Bar>
            <Bar
              dataKey="Drivers"
              stackId="a"
              fill="var(--color-Drivers)"
              radius={[4, 4, 0, 0]}
            >
              <LabelList dataKey="Drivers" position="inside" style={{ fill: 'white' }} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    
    </Card>
  );
};

export default Bari;
