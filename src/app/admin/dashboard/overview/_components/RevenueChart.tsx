"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format/intl";

type Point = { day: string; revenue: number; orders: number };

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--outline-variant)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={shortDay}
            tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            width={64}
            tickFormatter={(v: number) => formatPrice(v, "en")}
            tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
          />
          <Tooltip
            labelFormatter={(label) => shortDay(String(label))}
            formatter={(value, name) =>
              name === "revenue" ? [formatPrice(Number(value), "en"), "Revenue"] : [value, "Orders"]
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--brand-primary)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
