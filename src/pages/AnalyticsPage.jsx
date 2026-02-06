import React from 'react';

export default function AnalyticsPage({ darkMode, analytics, stats }) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className={`text-2xl font-light mb-8 ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Streak</div>
          <div className={`text-3xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{stats.streak}<span className="text-lg ml-1">days</span></div>
        </div>
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Total Completed</div>
          <div className={`text-3xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{stats.totalCompleted}<span className="text-lg ml-1">tasks</span></div>
        </div>
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Total Hours</div>
          <div className={`text-3xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.totalHours}<span className="text-lg ml-1">h</span></div>
        </div>
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Task Duration</div>
          <div className={`text-3xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.avgDuration}<span className="text-lg ml-1">min</span></div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Most Productive Day</div>
          <div className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.mostProductiveDay}</div>
        </div>
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs uppercase tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>This Week vs Last Week</div>
          <div className={`flex items-center gap-3 ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
            <span className="text-2xl font-light">{analytics.thisWeekCount}</span>
            <span className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>vs</span>
            <span className={`text-2xl font-light ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{analytics.lastWeekCount}</span>
            {analytics.thisWeekCount > analytics.lastWeekCount && <span className="text-sm text-green-500 font-medium">&#8593; Up</span>}
            {analytics.thisWeekCount < analytics.lastWeekCount && <span className="text-sm text-red-500 font-medium">&#8595; Down</span>}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className={`mt-4 p-5 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
        <div className={`text-xs uppercase tracking-wide mb-6 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Last 7 Days</div>
        <div className="flex items-end justify-between gap-3 h-40">
          {analytics.last7Days.map((day, i) => {
            const max = Math.max(...analytics.last7Days.map(d => d.count), 1);
            const h = (day.count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className={`text-xs tabular-nums ${darkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{day.count}</span>
                <div className="w-full bg-blue-500 rounded-t transition-all" style={{ height: `${h}%`, minHeight: day.count > 0 ? '8px' : '0' }} />
                <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
