import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function CalendarPage({
  darkMode, allTasks, backlogTasks, user,
  getWeekDays, currentWeekStart, nextWeek, prevWeek, goToToday,
  getScheduledTasksForDay, getUnscheduledTasksForDay,
  createScheduledTask, scheduleTask, editTask, deleteTask, updateTaskDuration,
}) {
  const [creatingTaskAt, setCreatingTaskAt] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [resizingTask, setResizingTask] = useState(null);
  const [resizeDuration, setResizeDuration] = useState(null);
  const resizeStartRef = useRef(null);
  const [editingCalendarTask, setEditingCalendarTask] = useState(null);
  const [editingCalendarText, setEditingCalendarText] = useState('');

  const startResize = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    const duration = task.scheduled_duration || 60;
    setResizingTask(task);
    setResizeDuration(duration);
    resizeStartRef.current = { startY: e.clientY, originalDuration: duration };
  };

  useEffect(() => {
    if (!resizingTask) return;
    const handleResizeMove = (e) => {
      if (!resizeStartRef.current) return;
      const deltaY = e.clientY - resizeStartRef.current.startY;
      const deltaMinutes = (deltaY / 64) * 60;
      let newDuration = resizeStartRef.current.originalDuration + deltaMinutes;
      newDuration = Math.round(newDuration / 15) * 15;
      newDuration = Math.max(15, newDuration);
      setResizeDuration(newDuration);
    };
    const handleResizeEnd = () => {
      if (resizingTask && resizeDuration != null) {
        updateTaskDuration(resizingTask.id, resizeDuration);
      }
      setResizingTask(null);
      setResizeDuration(null);
      resizeStartRef.current = null;
    };
    document.body.style.cursor = 's-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizingTask, resizeDuration]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Calendar Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
            Week of {currentWeekStart.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevWeek} className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={goToToday} className={`px-3 py-1 text-sm rounded transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Today</button>
            <button onClick={nextWeek} className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Week View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div className={`p-2 ${darkMode ? 'border-r border-zinc-800' : 'border-r border-gray-200'}`}></div>
            {getWeekDays().map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`p-3 text-center border-r last:border-r-0 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                    {day.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-light mt-1 ${isToday ? 'text-blue-500 font-medium' : darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day / Unscheduled tasks row */}
          {(() => {
            const weekDays = getWeekDays();
            const hasAny = weekDays.some(day => getUnscheduledTasksForDay(day).length > 0);
            if (!hasAny) return null;
            return (
              <div className={`border-b flex-shrink-0 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                <div className="grid grid-cols-8" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                  <div className={`px-1 py-2 text-[10px] uppercase tracking-wider text-right pr-2 border-r ${darkMode ? 'text-zinc-600 border-zinc-800' : 'text-gray-400 border-gray-200'}`}>
                    All day
                  </div>
                  {weekDays.map((day, i) => {
                    const unscheduled = getUnscheduledTasksForDay(day);
                    return (
                      <div
                        key={i}
                        className={`py-2 px-1.5 border-r last:border-r-0 min-h-[36px] ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}
                        onDrop={(e) => {
                          e.preventDefault();
                          const taskId = e.dataTransfer.getData('taskId');
                          if (taskId) {
                            const scheduledTime = new Date(day);
                            scheduledTime.setHours(9, 0, 0, 0);
                            scheduleTask(parseInt(taskId), scheduledTime.toISOString());
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="flex flex-wrap gap-1">
                          {unscheduled.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
                              className={`text-[11px] px-2 py-0.5 rounded-full cursor-move truncate max-w-full font-medium ${
                                darkMode
                                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title={task.text}
                            >
                              {task.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Time Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-8" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              {Array.from({ length: 24 }).map((_, hour) => (
                <React.Fragment key={hour}>
                  <div className={`h-16 p-2 text-right text-xs border-r border-b ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-200 text-gray-500'}`}>
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>

                  {getWeekDays().map((day, dayIndex) => {
                    const tasksInHour = getScheduledTasksForDay(day).filter(t => {
                      const taskTime = new Date(t.scheduled_time);
                      return taskTime.getHours() === hour;
                    });
                    const isCreating = creatingTaskAt?.dayIndex === dayIndex && creatingTaskAt?.hour === hour;
                    const hasTask = tasksInHour.length > 0;

                    return (
                      <div
                        key={dayIndex}
                        className={`h-16 border-r border-b last:border-r-0 relative cursor-pointer ${darkMode ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'}`}
                        style={hasTask ? { overflow: 'visible', zIndex: 1 } : undefined}
                        onClick={(e) => {
                          if (e.target === e.currentTarget && !isCreating) {
                            setCreatingTaskAt({ date: day, hour, dayIndex });
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const taskId = e.dataTransfer.getData('taskId');
                          if (taskId) {
                            const scheduledTime = new Date(day);
                            scheduledTime.setHours(hour, 0, 0, 0);
                            scheduleTask(parseInt(taskId), scheduledTime.toISOString());
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {isCreating ? (
                          <div className={`absolute inset-1 p-1 rounded ${darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'}`}>
                            <input
                              type="text" autoFocus value={newTaskText}
                              onChange={(e) => setNewTaskText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { createScheduledTask(newTaskText, day, hour); setCreatingTaskAt(null); setNewTaskText(''); }
                                else if (e.key === 'Escape') { setCreatingTaskAt(null); setNewTaskText(''); }
                              }}
                              onBlur={() => {
                                if (newTaskText.trim()) { createScheduledTask(newTaskText, day, hour); }
                                setCreatingTaskAt(null); setNewTaskText('');
                              }}
                              placeholder="Task name..."
                              className={`w-full text-xs bg-transparent border-none outline-none ${darkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-gray-800 placeholder-gray-400'}`}
                            />
                          </div>
                        ) : (
                          tasksInHour.map(task => {
                            const isResizing = resizingTask?.id === task.id;
                            const isEditing = editingCalendarTask === task.id;
                            const duration = isResizing ? resizeDuration : (task.scheduled_duration || 60);
                            const taskHeight = (duration / 60) * 64 - 4;
                            const startTime = new Date(task.scheduled_time);
                            const endTime = new Date(startTime.getTime() + duration * 60000);
                            const fmtTime = (d) => d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });

                            return (
                              <div
                                key={task.id}
                                draggable={!isResizing && !isEditing}
                                onDragStart={(e) => {
                                  if (isResizing || isEditing) { e.preventDefault(); return; }
                                  e.dataTransfer.setData('taskId', task.id.toString());
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute inset-x-1 top-1 p-1 text-xs rounded group select-none ${
                                  isResizing ? 'ring-2 ring-blue-400 shadow-lg' : isEditing ? '' : 'cursor-move'
                                } ${
                                  darkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                                style={{ height: `${Math.max(taskHeight, 12)}px`, zIndex: isResizing || isEditing ? 30 : 10, userSelect: 'none' }}
                              >
                                {isEditing ? (
                                  <input
                                    type="text" autoFocus value={editingCalendarText}
                                    onChange={(e) => setEditingCalendarText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') { if (editingCalendarText.trim()) editTask(task.id, editingCalendarText.trim()); setEditingCalendarTask(null); }
                                      else if (e.key === 'Escape') setEditingCalendarTask(null);
                                    }}
                                    onBlur={() => {
                                      if (editingCalendarText.trim() && editingCalendarText.trim() !== task.text) editTask(task.id, editingCalendarText.trim());
                                      setEditingCalendarTask(null);
                                    }}
                                    className={`w-full text-xs bg-transparent border-none outline-none font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}
                                  />
                                ) : (
                                  <div className="truncate font-medium">{task.text}</div>
                                )}
                                <div className="text-[10px] opacity-70">{fmtTime(startTime)} – {fmtTime(endTime)}</div>
                                {duration >= 45 && (
                                  <div className="text-[10px] opacity-50 mt-0.5">
                                    {duration >= 60 ? `${Math.floor(duration / 60)}h` : ''}{duration % 60 ? `${duration % 60}m` : ''}
                                  </div>
                                )}
                                {/* Edit & Delete buttons */}
                                {!isEditing && !isResizing && (
                                  <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingCalendarTask(task.id); setEditingCalendarText(task.text); }} className={`p-0.5 rounded ${darkMode ? 'hover:bg-blue-800/60 text-blue-400' : 'hover:bg-blue-200 text-blue-600'}`} title="Edit">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className={`p-0.5 rounded ${darkMode ? 'hover:bg-red-900/60 text-red-400' : 'hover:bg-red-100 text-red-500'}`} title="Delete">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </div>
                                )}
                                {/* Resize handle */}
                                <div
                                  className={`absolute bottom-0 left-1 right-1 h-2 cursor-s-resize rounded-b flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'hover:bg-blue-700/50' : 'hover:bg-blue-200/80'}`}
                                  onMouseDown={(e) => startResize(e, task)}
                                >
                                  <div className={`w-8 h-0.5 rounded ${darkMode ? 'bg-blue-400' : 'bg-blue-400'}`} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>

        {/* Backlog Panel */}
        <div className={`w-64 border-l flex-shrink-0 ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
            <h3 className={`font-medium ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Backlog</h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto h-full">
            {backlogTasks.map(task => (
              <div key={task.id} draggable onDragStart={(e) => { e.dataTransfer.setData('taskId', task.id.toString()); e.dataTransfer.setData('fromBacklog', 'true'); }} className={`text-sm p-2 rounded cursor-move ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                {task.text}
              </div>
            ))}
            {backlogTasks.length === 0 && (
              <div className={`text-sm text-center py-8 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>No backlog tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
