import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Configuration for chart data labels and colors
const chartConfig = {
  Driver: {
    label: "Driver",
    color: "hsl(var(--chart-1))",
  },
  Vehicles: {
    label: "Vehicles",
    color: "hsl(var(--chart-2))",
  },
  DriverRation: {
    label: "Driver Ratio",
    color: "hsl(var(--chart-3))",
  },
};

export function LiniTwoSec({ theme, chartData }) {
  const [timeRange, setTimeRange] = React.useState("365d"); // Default to Current Year
  const [filterType, setFilterType] = React.useState("All"); // Default to All

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    let daysToSubtract = 365; // Default to Current Year
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    now.setDate(now.getDate() - daysToSubtract);
    return date >= now;
  });

  // Filter based on selected filter type
  const dataToDisplay = filteredData.map(item => ({
    ...item,
    ...(filterType !== "All" ? { [filterType]: item[filterType] } : {}),
  }));

  return (
    <Card
      className={`w-[88%] font-sans shadow-xl mt-4 ${
        theme.theme === 'dark' ? 'dark' : 'light'
      }`}
    >
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardDescription>
            Number of Drivers, Vehicles and Driver Ration vs Date
          </CardDescription>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto text-xs"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="365d" className="rounded-lg">
                Current Year
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger
              className="w-[160px] rounded-lg text-xs"
              aria-label="Select a filter"
            >
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="All" className="rounded-lg">
                All
              </SelectItem>
              <SelectItem value="Vehicles" className="rounded-lg">
                Vehicles
              </SelectItem>
              <SelectItem value="Driver" className="rounded-lg">
                Drivers
              </SelectItem>
              <SelectItem value="DriverRation" className="rounded-lg">
                Driver Ratio
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={dataToDisplay}>
            <defs>
              <linearGradient id="fillDriver" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Driver)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Driver)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillVehicles" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Vehicles)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Vehicles)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDriverRation" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-DriverRation)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-DriverRation)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
            <Tooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            {filterType === "All" || filterType === "Vehicles" ? (
              <Area
                dataKey="Vehicles"
                type="natural"
                fill="url(#fillVehicles)"
                stroke="var(--color-Vehicles)"
                label={({ x, y, value }) => (
                  <text
                    x={x}
                    y={y}
                    fill="var(--color-Vehicles)"
                    fontSize={12}
                    textAnchor="middle"
                    dy={-10}
                  >
                    {value}
                  </text>
                )}
              />
            ) : null}
            {filterType === "All" || filterType === "Driver" ? (
              <Area
                dataKey="Driver"
                type="natural"
                fill="url(#fillDriver)"
                stroke="var(--color-Driver)"
                label={({ x, y, value }) => (
                  <text
                    x={x}
                    y={y}
                    fill="var(--color-Driver)"
                    fontSize={12}
                    textAnchor="middle"
                    dy={-10}
                  >
                    {value}
                  </text>
                )}
              />
            ) : null}
            {filterType === "All" || filterType === "DriverRation" ? (
              <Area
                dataKey="DriverRation"
                type="natural"
                fill="url(#fillDriverRation)"
                stroke="var(--color-DriverRation)"
                label={({ x, y, value }) => (
                  <text
                    x={x}
                    y={y}
                    fill="var(--color-DriverRation)"
                    fontSize={12}
                    textAnchor="middle"
                    dy={-10}
                  >
                    {value}
                  </text>
                )}
              />
            ) : null}
            <Legend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default LiniTwoSec;
