import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

export default function HistoryDay({ date, tasks, darkMode }) {
  const [expanded, setExpanded] = useState(false);
  const completed = tasks.filter(t => t.completed);
  return (
    <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
      <button onClick={() => setExpanded(!expanded)} className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
        <div className="flex items-center gap-2">
          <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''} ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
          <span className={`font-normal ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
        </div>
        <span className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{completed.length} task{completed.length !== 1 ? 's' : ''}</span>
      </button>
      {expanded && (
        <div className={`px-4 pb-3 space-y-2 border-t ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
          {completed.map(task => (
            <div key={task.id} className={`flex items-center gap-2 py-2 ${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
              <Check size={14} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{task.text}</span>
              {task.time_spent > 0 && <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>{(task.time_spent/60).toFixed(0)}m</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
