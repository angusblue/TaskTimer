import React, { useState, useEffect, useRef } from 'react';
import { Play, Check, Pause, X, ChevronRight, Star, ChevronUp } from 'lucide-react';

export default function TaskTimer() {
  const [allTasks, setAllTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeSetup, setShowTimeSetup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [trashedOpen, setTrashedOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [trashed, setTrashed] = useState([]);
  const [timerComplete, setTimerComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const soundIntervalRef = useRef(null);

  const playSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  };

  const startRepeatingSound = () => {
    playSound();
    soundIntervalRef.current = setInterval(playSound, 2000);
  };

  const stopRepeatingSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  };

  const playCompletionSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [800, 1000].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('darkMode');
    setDarkMode(stored !== null ? stored === 'true' : prefersDark);
    try { const f = localStorage.getItem('favorites'); if (f) setFavorites(JSON.parse(f)); } catch(e) {}
  }, []);

  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('trashed', JSON.stringify(trashed)); }, [trashed]);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('allTasks');
    if (stored) { try { setAllTasks(JSON.parse(stored)); } catch(e) { setAllTasks([]); } }
    try { const t = localStorage.getItem('trashed'); if (t) setTrashed(JSON.parse(t)); } catch(e) {}
  }, []);

  // Clean up trashed items older than 30 days
  useEffect(() => {
    const now = new Date();
    const cleaned = trashed.filter(t => {
      const age = (now - new Date(t.trashedAt)) / (1000 * 60 * 60 * 24);
      return age < 30;
    });
    if (cleaned.length !== trashed.length) setTrashed(cleaned);
  }, [trashed]);

  useEffect(() => { localStorage.setItem('allTasks', JSON.stringify(allTasks)); }, [allTasks]);

  useEffect(() => {
    let interval;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { setIsRunning(false); setTimerComplete(true); startRepeatingSound(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const todayTasks = allTasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString() && !t.isBacklog);
  const backlogTasks = allTasks.filter(t => t.isBacklog);

  const addTask = (text) => {
    if (!text.trim()) return;
    setAllTasks(prev => [...prev, { id: Date.now(), text, completed: false, timeSpent: 0, isBacklog: false, date: new Date().toISOString() }]);
  };

  const addBacklogTask = (text) => {
    if (!text.trim()) return;
    setAllTasks(prev => [...prev, { id: Date.now(), text, completed: false, timeSpent: 0, isBacklog: true, date: new Date().toISOString() }]);
  };

  const promoteToToday = (taskId) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, isBacklog: false, date: new Date().toISOString() } : t));
  };

  const deleteTask = (taskId) => {
    if (activeTaskId === taskId) { setActiveTaskId(null); setTimeRemaining(0); setIsRunning(false); setTimerComplete(false); stopRepeatingSound(); }
    if (selectedTaskId === taskId) { setSelectedTaskId(null); setShowTimeSetup(false); }
    const task = allTasks.find(t => t.id === taskId);
    if (task) setTrashed(prev => [...prev, { ...task, trashedAt: new Date().toISOString() }]);
    setAllTasks(curr => { const updated = curr.filter(t => t.id !== taskId); localStorage.setItem('allTasks', JSON.stringify(updated)); return updated; });
  };

  const restoreTask = (trashedTask) => {
    const { trashedAt, ...task } = trashedTask;
    setAllTasks(prev => [...prev, { ...task, id: Date.now() }]);
    setTrashed(prev => prev.filter(t => t.id !== trashedTask.id));
  };

  const permanentlyDelete = (trashedId) => {
    setTrashed(prev => prev.filter(t => t.id !== trashedId));
  };

  const clearAllTrashed = () => {
    setTrashed([]);
  };

  const handleStartClick = (taskId) => { setSelectedTaskId(taskId); setShowTimeSetup(true); setHours('00'); setMinutes('00'); setSeconds('00'); };

  const startTimer = () => {
    const total = (parseInt(hours)||0)*3600 + (parseInt(minutes)||0)*60 + (parseInt(seconds)||0);
    if (total > 0) { setActiveTaskId(selectedTaskId); setTimeRemaining(total); setInitialTime(total); setIsRunning(true); setShowTimeSetup(false); setSelectedTaskId(null); }
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => { if (timeRemaining > 0) setIsRunning(true); };

  const completeTask = () => {
    stopRepeatingSound();
    playCompletionSound();
    const spent = initialTime - timeRemaining;
    setAllTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, completed: true, timeSpent: (t.timeSpent||0) + spent } : t));
    setActiveTaskId(null); setTimeRemaining(0); setIsRunning(false); setTimerComplete(false);
  };

  const repeatTask = () => { stopRepeatingSound(); setTimeRemaining(initialTime); setIsRunning(true); setTimerComplete(false); };

  const toggleTaskComplete = (taskId) => setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));

  const editTask = (taskId, newText) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t));
  };

  const toggleFavorite = (task) => {
    setFavorites(prev => prev.some(f => f.text === task.text) ? prev.filter(f => f.text !== task.text) : [...prev, { id: Date.now(), text: task.text }]);
  };

  const addTaskFromFavorite = (fav) => {
    setAllTasks(prev => [...prev, { id: Date.now(), text: fav.text, completed: false, timeSpent: 0, isBacklog: false, date: new Date().toISOString() }]);
    setFavoritesOpen(false);
  };

  const addAllFavorites = () => {
    const now = Date.now();
    setAllTasks(prev => [...prev, ...favorites.map((f, i) => ({ id: now + i, text: f.text, completed: false, timeSpent: 0, isBacklog: false, date: new Date().toISOString() }))]);
    setFavoritesOpen(false);
  };

  const deleteFavorite = (id, e) => { e.stopPropagation(); setFavorites(prev => prev.filter(f => f.id !== id)); };
  const isFavorited = (text) => favorites.some(f => f.text === text);

  const getCircleProgress = () => initialTime === 0 ? 0 : timeRemaining / initialTime;

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const formatDate = (date) => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const d = new Date(date);
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const formatClock = (date) => {
    let h = date.getHours(); const m = date.getMinutes(); const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const groupTasksByDate = () => {
    const groups = {};
    allTasks.forEach(t => { const k = new Date(t.date).toDateString(); if (!groups[k]) groups[k] = []; groups[k].push(t); });
    return Object.entries(groups).sort((a,b) => new Date(b[0]) - new Date(a[0]));
  };

  const getStats = () => {
    const completed = allTasks.filter(t => t.completed);
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (completed.some(t => new Date(t.date).toDateString() === d.toDateString())) streak++;
      else if (i > 0) break;
    }
    return { totalCompleted: completed.length, streak };
  };

  const getAnalytics = () => {
    const completed = allTasks.filter(t => t.completed);
    const totalSeconds = completed.reduce((s,t) => s + (t.timeSpent||0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const avgDuration = completed.length > 0 ? (totalSeconds / completed.length / 60).toFixed(0) : 0;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      last7Days.push({ day: d.toLocaleDateString('en',{weekday:'short'})[0], count: completed.filter(t => new Date(t.date).toDateString() === d.toDateString()).length });
    }
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayCounts = {};
    completed.forEach(t => { const d = new Date(t.date).getDay(); dayCounts[d] = (dayCounts[d]||0)+1; });
    const mostProductiveDay = Object.entries(dayCounts).length > 0 ? dayNames[Object.entries(dayCounts).sort((a,b) => b[1]-a[1])[0][0]] : 'N/A';
    const thisWeekStart = new Date(); thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisWeekCount = completed.filter(t => new Date(t.date) >= thisWeekStart).length;
    const lastWeekCount = completed.filter(t => { const d = new Date(t.date); return d >= lastWeekStart && d < thisWeekStart; }).length;
    return { totalHours, avgDuration, last7Days, mostProductiveDay, thisWeekCount, lastWeekCount };
  };

  const activeTask = allTasks.find(t => t.id === activeTaskId);
  const stats = getStats();
  const analytics = getAnalytics();

  return (
    <div className={`h-screen flex relative ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>

      {/* Sidebar */}
      <div className={`transition-all duration-300 border-r ${sidebarOpen ? 'w-80' : 'w-0'} ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'} overflow-hidden`}>
        {sidebarOpen && (
          <div className="p-6 w-80 flex flex-col h-full">
            {/* Stats */}
            <div className="mb-4">
              <div className={`p-4 rounded-lg flex gap-4 ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Streak</div>
                  <div className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{stats.streak}</div>
                </div>
                <div className={`w-px ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`} />
                <div className="flex-1">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Total Tasks</div>
                  <div className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{stats.totalCompleted}</div>
                </div>
              </div>
            </div>

            {/* Analytics Toggle */}
            <button onClick={() => setAnalyticsOpen(!analyticsOpen)} className={`w-full mb-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${analyticsOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {analyticsOpen ? 'Hide Analytics' : 'Show Analytics'}
            </button>

            {/* Analytics */}
            {analyticsOpen && (
              <div className="mb-6 space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Total Hours</div>
                  <div className={`text-xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.totalHours}h</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Task Duration</div>
                  <div className={`text-xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.avgDuration} min</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Most Productive Day</div>
                  <div className={`text-xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{analytics.mostProductiveDay}</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs uppercase tracking-wide mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>This Week vs Last</div>
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                    <span className="text-xl font-light">{analytics.thisWeekCount}</span>
                    <span className="text-sm">vs</span>
                    <span className={`text-xl font-light ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{analytics.lastWeekCount}</span>
                    {analytics.thisWeekCount > analytics.lastWeekCount && <span className="text-xs text-green-500">↑</span>}
                    {analytics.thisWeekCount < analytics.lastWeekCount && <span className="text-xs text-red-500">↓</span>}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs uppercase tracking-wide mb-3 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Last 7 Days</div>
                  <div className="flex items-end justify-between gap-1 h-16">
                    {analytics.last7Days.map((day, i) => {
                      const max = Math.max(...analytics.last7Days.map(d => d.count), 1);
                      const h = (day.count / max) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-blue-500 rounded-t transition-all" style={{ height: `${h}%`, minHeight: day.count > 0 ? '4px' : '0' }} />
                          <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <h2 className={`text-xl font-light mb-4 ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>History</h2>
            <div className="space-y-2 overflow-y-auto flex-1">
              {groupTasksByDate().map(([date, tasks]) => <HistoryDay key={date} date={date} tasks={tasks} darkMode={darkMode} />)}
            </div>
          </div>
        )}
      </div>

      {/* Left Panel - Tasks */}
      <div className={`flex-1 border-r flex flex-col ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="p-8 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {sidebarOpen ? <X size={20} /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
              <div>
                <div className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatClock(currentTime)}</div>
                <h1 className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatDate(new Date())}</h1>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>☾</button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg relative">
            <div className={darkMode ? 'bg-zinc-900' : 'bg-gray-50'}>
              {todayTasks.map(task => (
                <TaskRow key={task.id} task={task} darkMode={darkMode} isActive={task.id === activeTaskId} onStartClick={handleStartClick} onDelete={deleteTask} onToggleComplete={toggleTaskComplete} onToggleFavorite={toggleFavorite} isFavorited={isFavorited(task.text)} showBorder={true} onEdit={editTask} />
              ))}
              <TaskRow darkMode={darkMode} onAdd={addTask} isNew={true} showBorder={todayTasks.length > 0} />
            </div>

            {/* Floating Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {/* Trash Button */}
              <button onClick={() => { setTrashedOpen(!trashedOpen); setBacklogOpen(false); setFavoritesOpen(false); }} className={`p-3 rounded-full shadow-lg transition-all ${trashedOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
              {/* Backlog Button */}
              <button onClick={() => { setBacklogOpen(!backlogOpen); setFavoritesOpen(false); setTrashedOpen(false); }} className={`p-3 rounded-full shadow-lg transition-all ${backlogOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                  <line x1="4" y1="6" x2="4.01" y2="6"/><line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/>
                </svg>
              </button>
              {/* Favorites Button */}
              <button onClick={() => { setFavoritesOpen(!favoritesOpen); setBacklogOpen(false); setTrashedOpen(false); }} className={`p-3 rounded-full shadow-lg transition-all ${favoritesOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                <Star size={20} fill={favoritesOpen ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trashed Popup */}
            {trashedOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTrashedOpen(false)} />
                <div className={`absolute bottom-20 right-4 w-72 rounded-lg shadow-xl border overflow-hidden z-20 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Deleted</h3>
                    {trashed.length > 0 && (
                      <button onClick={clearAllTrashed} className={`text-xs px-3 py-1 rounded hover:opacity-70 transition-colors ${darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-500'}`}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {trashed.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Nothing here. Deleted tasks are kept for 30 days.</div>
                    ) : (
                      trashed.map((task) => {
                        const daysLeft = Math.ceil(30 - (new Date() - new Date(task.trashedAt)) / (1000*60*60*24));
                        return (
                          <div key={task.id} className={`px-4 py-3 flex items-center gap-2 transition-colors border-b last:border-b-0 ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm truncate block ${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>{task.text}</span>
                              <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>{daysLeft} days left</span>
                            </div>
                            <button onClick={() => restoreTask(task)} className={`p-1 rounded transition-colors text-xs font-medium ${darkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-500 hover:bg-blue-50'}`}>Restore</button>
                            <button onClick={() => permanentlyDelete(task.id)} className={`p-1 rounded transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`}><X size={14} /></button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Backlog Popup */}
            {backlogOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBacklogOpen(false)} />
                <div className={`absolute bottom-20 right-4 w-72 rounded-lg shadow-xl border overflow-hidden z-20 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Backlog</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {backlogTasks.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>No backlog tasks yet. Add one below!</div>
                    ) : (
                      backlogTasks.map(task => (
                        <div key={task.id} className={`px-4 py-3 flex items-center gap-2 transition-colors border-b last:border-b-0 ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 border-dashed flex-shrink-0 ${darkMode ? 'border-zinc-600' : 'border-gray-300'}`} />
                          <span className={`flex-1 truncate text-sm ${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>{task.text}</span>
                          <button onClick={() => promoteToToday(task.id)} className={`p-1 rounded transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`} title="Move to today"><ChevronUp size={16} /></button>
                          <button onClick={() => deleteTask(task.id)} className={`p-1 rounded transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`}><X size={14} /></button>
                        </div>
                      ))
                    )}
                  </div>
                  <BacklogInput darkMode={darkMode} onAdd={addBacklogTask} />
                </div>
              </>
            )}

            {/* Favorites Popup */}
            {favoritesOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFavoritesOpen(false)} />
                <div className={`absolute bottom-20 right-4 w-64 rounded-lg shadow-xl border overflow-hidden z-20 ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Favorites</h3>
                      {favorites.length > 0 && <button onClick={addAllFavorites} className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Add All</button>}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {favorites.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>No favorites yet. Star a task to add it here!</div>
                    ) : (
                      favorites.map(fav => (
                        <div key={fav.id} className={`w-full px-4 py-3 flex items-center gap-2 transition-colors border-b last:border-b-0 ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <button onClick={() => addTaskFromFavorite(fav)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                            <Star size={16} className={darkMode ? 'text-zinc-100' : 'text-gray-800'} fill="currentColor" />
                            <span className={`flex-1 truncate ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{fav.text}</span>
                          </button>
                          <button onClick={(e) => deleteFavorite(fav.id, e)} className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`}><X size={14} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Timer */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
        {showTimeSetup ? (
          <div className="text-center">
            <div className={`text-lg mb-8 font-light ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              {allTasks.find(t => t.id === selectedTaskId)?.text}
            </div>
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex flex-col items-center">
                <input type="text" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-20 text-5xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
                <span className={`text-sm mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>hours</span>
              </div>
              <span className={`text-5xl font-light ${darkMode ? 'text-zinc-400' : 'text-gray-400'}`}>:</span>
              <div className="flex flex-col items-center">
                <input type="text" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-20 text-5xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
                <span className={`text-sm mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>min</span>
              </div>
              <span className={`text-5xl font-light ${darkMode ? 'text-zinc-400' : 'text-gray-400'}`}>:</span>
              <div className="flex flex-col items-center">
                <input type="text" inputMode="numeric" value={seconds} onChange={(e) => setSeconds(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} onFocus={(e) => e.target.select()} className={`w-20 text-5xl font-light text-center bg-transparent border-none outline-none tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} />
                <span className={`text-sm mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>sec</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setShowTimeSetup(false); setSelectedTaskId(null); }} className={`px-6 py-3 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cancel</button>
              <button onClick={startTimer} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Start</button>
            </div>
          </div>
        ) : activeTask ? (
          <div className="text-center">
            <div className={`text-lg mb-4 font-light ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{activeTask.text}</div>
            <div className="relative inline-flex items-center justify-center mb-8">
              <svg width="320" height="320" className="transform -rotate-90">
                <circle cx="160" cy="160" r="150" fill="none" stroke={darkMode ? '#27272a' : '#f3f4f6'} strokeWidth="8" />
                <circle cx="160" cy="160" r="150" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2*Math.PI*150}`} strokeDashoffset={`${2*Math.PI*150*(1-getCircleProgress())}`} className="transition-all duration-1000 linear" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-6xl font-light tabular-nums ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatTime(timeRemaining)}</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              {!timerComplete ? (
                <>
                  {isRunning ? (
                    <button onClick={pauseTimer} className={`p-4 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Pause size={24} /></button>
                  ) : (
                    <button onClick={resumeTimer} className={`p-4 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Play size={24} /></button>
                  )}
                  <button onClick={completeTask} className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><Check size={24} /></button>
                </>
              ) : (
                <>
                  <button onClick={repeatTask} className={`p-4 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
                  </button>
                  <button onClick={completeTask} className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><Check size={24} /></button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={`text-center text-xl font-light ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>What will you achieve today?</div>
        )}
      </div>
    </div>
  );
}

function BacklogInput({ darkMode, onAdd }) {
  const [text, setText] = useState('');
  const handleAdd = () => { if (text.trim()) { onAdd(text); setText(''); } };
  return (
    <div className={`px-4 py-3 border-t flex items-center gap-2 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
      <input type="text" placeholder="Add to backlog" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} className={`flex-1 text-sm bg-transparent border-none outline-none ${darkMode ? 'text-zinc-100 placeholder-zinc-600' : 'text-gray-800 placeholder-gray-400'}`} />
    </div>
  );
}

function HistoryDay({ date, tasks, darkMode }) {
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
              {task.timeSpent > 0 && <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>{(task.timeSpent/60).toFixed(0)}m</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, darkMode, isActive, onStartClick, onDelete, onToggleComplete, onToggleFavorite, isFavorited, onAdd, isNew, showBorder, onEdit }) {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const editRef = useRef(null);
  const handleAdd = () => { if (text.trim()) { onAdd(text); setText(''); } };
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleAdd(); };

  const startEdit = () => { setEditText(task.text); setEditing(true); setTimeout(() => { editRef.current?.focus(); if (editRef.current) { editRef.current.style.height = 'auto'; editRef.current.style.height = editRef.current.scrollHeight + 'px'; } }, 0); };
  const saveEdit = () => { if (editText.trim()) onEdit(task.id, editText.trim()); setEditing(false); };
  const handleEditKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') setEditing(false); };
  const handleEditChange = (e) => { setEditText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; };

  if (isNew) {
    return (
      <div className={`px-4 py-3 flex items-center gap-3 ${showBorder ? (darkMode ? 'border-t border-zinc-800' : 'border-t border-gray-200') : ''}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${darkMode ? 'border-zinc-600' : 'border-gray-300'}`} />
        <input type="text" placeholder="New task" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={handleKeyPress} className={`flex-1 bg-transparent border-none outline-none font-normal ${darkMode ? 'text-zinc-100 placeholder-zinc-600' : 'text-gray-800 placeholder-gray-400'}`} />
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 flex items-center gap-3 transition-colors ${showBorder ? (darkMode ? 'border-b border-zinc-800' : 'border-b border-gray-200') : ''} ${isActive ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : (darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100')}`}>
      <div onClick={() => onToggleComplete(task.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${task.completed ? 'bg-blue-500 border-blue-500' : (darkMode ? 'border-zinc-600 hover:border-zinc-500' : 'border-gray-300 hover:border-gray-400')}`}>
        {task.completed && <Check size={12} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <textarea ref={editRef} value={editText} onChange={handleEditChange} onKeyDown={handleEditKey} onBlur={saveEdit} rows={1} className={`w-full bg-transparent border-none outline-none font-normal resize-none overflow-hidden ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`} style={{ minHeight: '1.25rem' }} />
        ) : (
          <div onClick={!task.completed && !isActive ? startEdit : undefined} className={`font-normal break-words ${!task.completed && !isActive ? 'cursor-pointer' : ''} ${task.completed ? (darkMode ? 'line-through text-zinc-500' : 'line-through text-gray-400') : (darkMode ? 'text-zinc-100' : 'text-gray-800')}`}>{task.text}</div>
        )}
      </div>
      {!task.completed && !isActive && (
        <>
          <button onClick={() => onToggleFavorite(task)} className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isFavorited ? (darkMode ? 'text-zinc-100 hover:bg-zinc-700' : 'text-gray-800 hover:bg-gray-200') : (darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200')}`}>
            <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onStartClick(task.id)} className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`}>
            <Play size={16} />
          </button>
        </>
      )}
      {isActive && <div className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>Active</div>}
      {!isActive && !task.completed && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${darkMode ? 'text-zinc-400 hover:bg-zinc-700' : 'text-gray-400 hover:bg-gray-200'}`}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}