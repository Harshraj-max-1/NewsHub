import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function ReadingStatsChart({ weeklyActivity = [], categoryDistribution = [] }) {
  const isDark = document.documentElement.classList.contains('dark');
  const barColor = isDark ? '#E5E5E5' : '#171717';
  const gridTextColor = isDark ? '#A3A3A3' : '#737373';

  const pieColors = isDark 
    ? ['#E5E5E5', '#A3A3A3', '#737373', '#525252', '#404040'] 
    : ['#171717', '#404040', '#737373', '#A3A3A3', '#D4D4D4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
      {/* 7-Day Reading Frequency */}
      <div className="lg:col-span-7 bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Weekly Reading Activity
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Number of stories explored per day
          </p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: gridTextColor, fontSize: 11 }}
                axisLine={{ stroke: isDark ? '#262626' : '#E5E5E5' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: gridTextColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: isDark ? '#333333' : '#E5E5E5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: '12px',
                  borderRadius: '0px',
                  boxShadow: 'none'
                }}
              />
              <Bar dataKey="articles" fill={barColor} radius={[2, 2, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Affinity Breakdown */}
      <div className="lg:col-span-5 bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Top Categories
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Distribution across topic domains
          </p>
        </div>
        <div className="h-56 w-full flex items-center justify-center">
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#333333' : '#E5E5E5',
                    fontSize: '12px',
                    borderRadius: '0px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-neutral-400">Start reading articles to view topic breakdown</p>
          )}
        </div>
      </div>
    </div>
  );
}
