import React, { useState } from 'react';
import { Play, Pause, Check, X } from 'lucide-react';

export default function FloatingTimer({
  darkMode, activeTask, showTimeSetup, selectedTask,
  hours, setHours, minutes, setMinutes, seconds, setSeconds,
  startTimer, cancelSetup, pauseTimer, resumeTimer, completeTask, repeatTask,
  isRunning, timerComplete, timeRemaining, initialTime, formatTime, getCircleProgress
}) {
  const [expanded, setExpanded] = useState(false);

  // Nothing to show
  if (!activeTask && !showTimeSetup) return null;

  // Time setup mode — always show expanded
  if (showTimeSetup && selectedTask) {
    return (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl shadow-2xl border p-6 w-96 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <div className={`text-sm mb-4 font-medium text-center ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
          {selectedTask.text}
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex flex-col items-center">
            <input type="text" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-14 text-3xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
            <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>hrs</span>
          </div>
          <span className={`text-3xl font-light ${darkMode ? 'text-zinc-400' : 'text-gray-400'}`}>:</span>
          <div className="flex flex-col items-center">
            <input type="text" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-14 text-3xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
            <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>min</span>
          </div>
          <span className={`text-3xl font-light ${darkMode ? 'text-zinc-400' : 'text-gray-400'}`}>:</span>
          <div className="flex flex-col items-center">
            <input type="text" inputMode="numeric" value={seconds} onChange={(e) => setSeconds(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-14 text-3xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
            <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>sec</span>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={cancelSetup} className={`px-4 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cancel</button>
          <button onClick={startTimer} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">Start</button>
        </div>
      </div>
    );
  }

  // Active timer — collapsed pill or expanded view
  if (activeTask) {
    if (!expanded) {
      return (
        <button
          onClick={() => setExpanded(true)}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full shadow-2xl border px-5 py-3 flex items-center gap-3 transition-all hover:scale-105 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}
        >
          {/* Mini progress ring */}
          <svg width="28" height="28" className="transform -rotate-90 flex-shrink-0">
            <circle cx="14" cy="14" r="11" fill="none" stroke={darkMode ? '#27272a' : '#e5e7eb'} strokeWidth="3" />
            <circle cx="14" cy="14" r="11" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${2*Math.PI*11}`} strokeDashoffset={`${2*Math.PI*11*(1-getCircleProgress())}`} />
          </svg>
          <span className={`text-sm font-medium truncate max-w-32 ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{activeTask.text}</span>
          <span className={`text-lg font-light tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatTime(timeRemaining)}</span>
          {isRunning ? (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          ) : timerComplete ? (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          )}
        </button>
      );
    }

    // Expanded timer
    return (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl shadow-2xl border p-6 w-80 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <button onClick={() => setExpanded(false)} className={`absolute top-3 right-3 p-1 rounded-full ${darkMode ? 'text-zinc-500 hover:bg-zinc-800' : 'text-gray-400 hover:bg-gray-100'}`}>
          <X size={16} />
        </button>
        <div className={`text-sm mb-3 font-medium text-center truncate ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{activeTask.text}</div>
        <div className="relative inline-flex items-center justify-center mb-4 w-full">
          <svg width="160" height="160" className="transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke={darkMode ? '#27272a' : '#f3f4f6'} strokeWidth="6" />
            <circle cx="80" cy="80" r="70" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*70}`} strokeDashoffset={`${2*Math.PI*70*(1-getCircleProgress())}`} className="transition-all duration-1000 linear" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-3xl font-light tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatTime(timeRemaining)}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          {!timerComplete ? (
            <>
              {isRunning ? (
                <button onClick={pauseTimer} className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Pause size={20} /></button>
              ) : (
                <button onClick={resumeTimer} className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Play size={20} /></button>
              )}
              <button onClick={completeTask} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><Check size={20} /></button>
            </>
          ) : (
            <>
              <button onClick={repeatTask} className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
              </button>
              <button onClick={completeTask} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><Check size={20} /></button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
