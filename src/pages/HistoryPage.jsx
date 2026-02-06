import React from 'react';
import HistoryDay from '../components/HistoryDay';

export default function HistoryPage({ darkMode, groupTasksByDate }) {
  const groups = groupTasksByDate();

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className={`text-2xl font-light mb-8 ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>History</h1>

      {groups.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
          No task history yet. Complete some tasks to see them here.
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {groups.map(([date, tasks]) => (
            <HistoryDay key={date} date={date} tasks={tasks} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}
