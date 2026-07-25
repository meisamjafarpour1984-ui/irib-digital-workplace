'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { trafficData } from '@/lib/dashboard-data'

export function TrafficDonut() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
        <h2 className="text-sm font-bold text-foreground">منابع ترافیک</h2>
      </div>

      <div className="relative h-44 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={trafficData}
              dataKey="value"
              nameKey="source"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              startAngle={90}
              endAngle={450}
              strokeWidth={0}
            >
              {trafficData.map((slice) => (
                <Cell key={slice.source} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-foreground">۱۰۰٪</span>
          <span className="text-xs text-muted-foreground">کل ترافیک</span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {trafficData.map((slice) => (
          <li key={slice.source} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-3 rounded-sm" style={{ background: slice.color }} aria-hidden />
              {slice.source}
            </span>
            <span className="font-bold text-foreground">{slice.value}٪</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
