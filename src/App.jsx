import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import NavRail from './components/NavRail';
import FloatingTimer from './components/FloatingTimer';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import NotesPage from './pages/NotesPage';

export default function TaskTimer() {
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('magic');
  const [authError, setAuthError] = useState('');

  // App state
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
  const [favorites, setFavorites] = useState([]);
  const [trashed, setTrashed] = useState([]);
  const [timerComplete, setTimerComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const soundIntervalRef = useRef(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);
  const [showYesterdayTasks, setShowYesterdayTasks] = useState(true);
  const [activePage, setActivePage] = useState('tasks');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  // Auth effects
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) { loadTasks(); loadFavorites(); loadTrashed(); }
  }, [user]);

  // Data loaders
  const loadTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error loading tasks:', error); } else {
      const sorted = (data || []).sort((a, b) => {
        if (a.order_position != null && b.order_position != null) return a.order_position - b.order_position;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setAllTasks(sorted);
    }
  };

  const loadFavorites = async () => {
    const { data, error } = await supabase.from('favorites').select('*').order('created_at', { ascending: false });
    if (!error) setFavorites(data || []);
  };

  const loadTrashed = async () => {
    const { data, error } = await supabase.from('trashed').select('*').order('trashed_at', { ascending: false });
    if (!error) setTrashed(data || []);
  };

  // Auth handlers
  const handleMagicLink = async (e) => {
    e.preventDefault(); setAuthError('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'https://task-timer-dun-phi.vercel.app' } });
    if (error) setAuthError(error.message);
    else { setAuthError('Check your email for the magic link!'); setEmail(''); }
  };

  const handlePasswordSignIn = async (e) => {
    e.preventDefault(); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handlePasswordSignUp = async (e) => {
    e.preventDefault(); setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'https://task-timer-dun-phi.vercel.app' } });
    if (error) setAuthError(error.message);
    else setAuthError('Account created! Check your email to confirm.');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAllTasks([]); setFavorites([]); setTrashed([]);
  };

  // Sound helpers
  const playSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  };
  const startRepeatingSound = () => { playSound(); soundIntervalRef.current = setInterval(playSound, 2000); };
  const stopRepeatingSound = () => { if (soundIntervalRef.current) { clearInterval(soundIntervalRef.current); soundIntervalRef.current = null; } };
  const playCompletionSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [800, 1000].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = freq; osc.type = 'sine';
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    });
  };

  // Theme & clock
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('darkMode');
    setDarkMode(stored !== null ? stored === 'true' : prefersDark);
  }, []);
  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // Timer
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

  // Derived state
  const todayTasks = allTasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString() && !t.is_backlog);
  const backlogTasks = allTasks.filter(t => t.is_backlog);
  const getYesterdayTasks = () => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    return allTasks.filter(t => new Date(t.date).toDateString() === yesterday.toDateString() && !t.completed && !t.is_backlog);
  };
  const yesterdayTasks = getYesterdayTasks();

  // Task CRUD
  const addTask = async (text) => {
    if (!text.trim() || !user) return;
    const todayTasksOrdered = allTasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString() && !t.is_backlog).sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
    const maxOrder = todayTasksOrdered.length > 0 ? Math.max(...todayTasksOrdered.map(t => t.order_position || 0)) : 0;
    const newTask = { user_id: user.id, text, completed: false, time_spent: 0, is_backlog: false, date: new Date().toISOString(), order_position: maxOrder + 1 };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (!error && data) setAllTasks(prev => [...prev, data[0]]);
  };

  const addBacklogTask = async (text) => {
    if (!text.trim() || !user) return;
    const newTask = { user_id: user.id, text, completed: false, time_spent: 0, is_backlog: true, date: new Date().toISOString() };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (!error && data) setAllTasks(prev => [data[0], ...prev]);
  };

  const promoteToToday = async (taskId) => {
    const { error } = await supabase.from('tasks').update({ is_backlog: false, date: new Date().toISOString() }).eq('id', taskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_backlog: false, date: new Date().toISOString() } : t));
  };

  const deleteTask = async (taskId) => {
    if (activeTaskId === taskId) { setActiveTaskId(null); setTimeRemaining(0); setIsRunning(false); setTimerComplete(false); stopRepeatingSound(); }
    if (selectedTaskId === taskId) { setSelectedTaskId(null); setShowTimeSetup(false); }
    const task = allTasks.find(t => t.id === taskId);
    if (task && user) {
      const { error: trashedError } = await supabase.from('trashed').insert([{ user_id: user.id, text: task.text, completed: task.completed, time_spent: task.time_spent, is_backlog: task.is_backlog, date: task.date, trashed_at: new Date().toISOString() }]);
      if (trashedError) { console.error('Error moving to trash:', trashedError); return; }
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (!error) { setAllTasks(curr => curr.filter(t => t.id !== taskId)); await loadTrashed(); }
    }
  };

  const restoreTask = async (trashedTask) => {
    if (!user) return;
    const { error: restoreError } = await supabase.from('tasks').insert([{ user_id: user.id, text: trashedTask.text, completed: trashedTask.completed, time_spent: trashedTask.time_spent, is_backlog: trashedTask.is_backlog, date: trashedTask.date }]);
    if (restoreError) return;
    const { error } = await supabase.from('trashed').delete().eq('id', trashedTask.id);
    if (!error) { await loadTasks(); await loadTrashed(); }
  };

  const permanentlyDelete = async (trashedId) => {
    const { error } = await supabase.from('trashed').delete().eq('id', trashedId);
    if (!error) setTrashed(prev => prev.filter(t => t.id !== trashedId));
  };

  const clearAllTrashed = async () => {
    if (!user) return;
    const { error } = await supabase.from('trashed').delete().eq('user_id', user.id);
    if (!error) setTrashed([]);
  };

  const toggleTaskComplete = async (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', taskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const editTask = async (taskId, newText) => {
    const { error } = await supabase.from('tasks').update({ text: newText }).eq('id', taskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t));
  };

  // Timer handlers
  const handleStartClick = (taskId) => { setSelectedTaskId(taskId); setShowTimeSetup(true); setHours('00'); setMinutes('00'); setSeconds('00'); };
  const startTimer = () => {
    const total = (parseInt(hours)||0)*3600 + (parseInt(minutes)||0)*60 + (parseInt(seconds)||0);
    if (total > 0) { setActiveTaskId(selectedTaskId); setTimeRemaining(total); setInitialTime(total); setIsRunning(true); setShowTimeSetup(false); setSelectedTaskId(null); }
  };
  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => { if (timeRemaining > 0) setIsRunning(true); };
  const completeTask = async () => {
    stopRepeatingSound(); playCompletionSound();
    const spent = initialTime - timeRemaining;
    const { error } = await supabase.from('tasks').update({ completed: true, time_spent: allTasks.find(t => t.id === activeTaskId)?.time_spent + spent }).eq('id', activeTaskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, completed: true, time_spent: (t.time_spent||0) + spent } : t));
    setActiveTaskId(null); setTimeRemaining(0); setIsRunning(false); setTimerComplete(false);
  };
  const repeatTask = () => { stopRepeatingSound(); setTimeRemaining(initialTime); setIsRunning(true); setTimerComplete(false); };

  // Drag & drop
  const reorderTasks = async (draggedTaskId, targetTaskId) => {
    const draggedIndex = todayTasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = todayTasks.findIndex(t => t.id === targetTaskId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const reordered = [...todayTasks];
    const [movedTask] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedTask);
    const updates = reordered.map((task, index) => ({ id: task.id, order_position: index }));
    setAllTasks(prev => {
      const otherTasks = prev.filter(t => !todayTasks.find(tt => tt.id === t.id));
      return [...otherTasks, ...reordered.map((t, i) => ({ ...t, order_position: i }))];
    });
    for (const update of updates) { await supabase.from('tasks').update({ order_position: update.order_position }).eq('id', update.id); }
  };
  const handleDragStart = (e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, task) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (draggedTask && task.id !== draggedTask.id) setDragOverTask(task); };
  const handleDragEnd = () => { if (draggedTask && dragOverTask && draggedTask.id !== dragOverTask.id) reorderTasks(draggedTask.id, dragOverTask.id); setDraggedTask(null); setDragOverTask(null); };
  const handleDrop = (e) => { e.preventDefault(); };

  // Yesterday tasks
  const addYesterdayTaskToToday = async (task) => {
    const { error } = await supabase.from('tasks').update({ date: new Date().toISOString() }).eq('id', task.id);
    if (!error) setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, date: new Date().toISOString() } : t));
  };
  const addAllYesterdayTasks = async () => {
    await Promise.all(yesterdayTasks.map(task => supabase.from('tasks').update({ date: new Date().toISOString() }).eq('id', task.id)));
    setAllTasks(prev => prev.map(t => yesterdayTasks.find(yt => yt.id === t.id) ? { ...t, date: new Date().toISOString() } : t));
    setShowYesterdayTasks(false);
  };
  const dismissYesterdayTasks = async () => {
    await Promise.all(yesterdayTasks.map(task => supabase.from('tasks').update({ is_backlog: true }).eq('id', task.id)));
    setAllTasks(prev => prev.map(t => yesterdayTasks.find(yt => yt.id === t.id) ? { ...t, is_backlog: true } : t));
    setShowYesterdayTasks(false);
  };

  // Calendar helpers
  const getWeekDays = () => {
    const days = []; const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) { const day = new Date(start); day.setDate(start.getDate() + i); days.push(day); }
    return days;
  };
  const nextWeek = () => { const n = new Date(currentWeekStart); n.setDate(n.getDate() + 7); setCurrentWeekStart(n); };
  const prevWeek = () => { const p = new Date(currentWeekStart); p.setDate(p.getDate() - 7); setCurrentWeekStart(p); };
  const goToToday = () => { const now = new Date(); const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1); setCurrentWeekStart(new Date(now.setDate(diff))); };

  const scheduleTask = async (taskId, scheduledTime) => {
    const { error } = await supabase.from('tasks').update({ scheduled_time: scheduledTime }).eq('id', taskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, scheduled_time: scheduledTime } : t));
  };

  const updateTaskDuration = async (taskId, duration) => {
    const { error } = await supabase.from('tasks').update({ scheduled_duration: duration }).eq('id', taskId);
    if (!error) setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, scheduled_duration: duration } : t));
  };

  const getTasksForDay = (date) => allTasks.filter(t => { if (t.is_backlog) return false; return new Date(t.date).toDateString() === date.toDateString(); });
  const getScheduledTasksForDay = (date) => getTasksForDay(date).filter(t => t.scheduled_time);
  const getUnscheduledTasksForDay = (date) => getTasksForDay(date).filter(t => !t.scheduled_time);

  const createScheduledTask = async (text, date, hour) => {
    if (!text.trim() || !user) return;
    const scheduledTime = new Date(date); scheduledTime.setHours(hour, 0, 0, 0);
    const dayTasks = getTasksForDay(date);
    const maxOrder = dayTasks.length > 0 ? Math.max(...dayTasks.map(t => t.order_position || 0)) : 0;
    const newTask = { user_id: user.id, text, completed: false, time_spent: 0, is_backlog: false, date: date.toISOString(), order_position: maxOrder + 1, scheduled_time: scheduledTime.toISOString(), scheduled_duration: 60 };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (!error && data) setAllTasks(prev => [...prev, data[0]]);
  };

  // Favorites
  const toggleFavorite = async (task) => {
    if (!user) return;
    const existing = favorites.find(f => f.text === task.text);
    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      if (!error) setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const { data, error } = await supabase.from('favorites').insert([{ user_id: user.id, text: task.text }]).select();
      if (!error && data) setFavorites(prev => [...prev, data[0]]);
    }
  };
  const addTaskFromFavorite = async (fav) => { await addTask(fav.text); };
  const addAllFavorites = async () => { for (const fav of favorites) await addTask(fav.text); };
  const deleteFavorite = async (id, e) => { e.stopPropagation(); const { error } = await supabase.from('favorites').delete().eq('id', id); if (!error) setFavorites(prev => prev.filter(f => f.id !== id)); };
  const isFavorited = (text) => favorites.some(f => f.text === text);

  // Formatting
  const getCircleProgress = () => initialTime === 0 ? 0 : timeRemaining / initialTime;
  const formatTime = (secs) => { const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60; return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; };
  const formatDate = (date) => { const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; const months = ['January','February','March','April','May','June','July','August','September','October','November','December']; const d = new Date(date); return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`; };
  const formatClock = (date) => { let h = date.getHours(); const m = date.getMinutes(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2,'0')} ${ampm}`; };

  // Analytics
  const groupTasksByDate = () => { const groups = {}; allTasks.forEach(t => { const k = new Date(t.date).toDateString(); if (!groups[k]) groups[k] = []; groups[k].push(t); }); return Object.entries(groups).sort((a,b) => new Date(b[0]) - new Date(a[0])); };
  const getStats = () => {
    const completed = allTasks.filter(t => t.completed); let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (completed.some(t => new Date(t.date).toDateString() === d.toDateString())) streak++; else if (i > 0) break; }
    return { totalCompleted: completed.length, streak };
  };
  const getAnalytics = () => {
    const completed = allTasks.filter(t => t.completed);
    const totalSeconds = completed.reduce((s,t) => s + (t.time_spent||0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const avgDuration = completed.length > 0 ? (totalSeconds / completed.length / 60).toFixed(0) : 0;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7Days.push({ day: d.toLocaleDateString('en',{weekday:'short'})[0], count: completed.filter(t => new Date(t.date).toDateString() === d.toDateString()).length }); }
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayCounts = {}; completed.forEach(t => { const d = new Date(t.date).getDay(); dayCounts[d] = (dayCounts[d]||0)+1; });
    const mostProductiveDay = Object.entries(dayCounts).length > 0 ? dayNames[Object.entries(dayCounts).sort((a,b) => b[1]-a[1])[0][0]] : 'N/A';
    const thisWeekStart = new Date(); thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisWeekCount = completed.filter(t => new Date(t.date) >= thisWeekStart).length;
    const lastWeekCount = completed.filter(t => { const d = new Date(t.date); return d >= lastWeekStart && d < thisWeekStart; }).length;
    return { totalHours, avgDuration, last7Days, mostProductiveDay, thisWeekCount, lastWeekCount };
  };

  // Loading screen
  if (loading) {
    return <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}><div className={`text-xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Loading...</div></div>;
  }

  // Auth screen
  if (!user) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
        <div className={`w-full max-w-md p-8 rounded-xl ${darkMode ? 'bg-zinc-950' : 'bg-white'} shadow-lg`}>
          <h1 className={`text-3xl font-light mb-2 text-center ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>TaskTimer</h1>
          <p className={`text-sm text-center mb-8 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{authMode === 'magic' ? 'Sign in with a magic link' : 'Sign in with password'}</p>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setAuthMode('magic')} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${authMode === 'magic' ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Magic Link</button>
            <button onClick={() => setAuthMode('password')} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${authMode === 'password' ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Password</button>
          </div>
          {authMode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`} required />
              {authError && <div className={`text-sm ${authError.includes('Check your email') || authError.includes('created') ? 'text-green-500' : 'text-red-500'}`}>{authError}</div>}
              <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Send Magic Link</button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`} required />
              {authError && <div className={`text-sm ${authError.includes('Check your email') || authError.includes('created') ? 'text-green-500' : 'text-red-500'}`}>{authError}</div>}
              <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Sign In</button>
              <button type="button" onClick={handlePasswordSignUp} className={`w-full py-2 rounded-lg text-sm transition-colors ${darkMode ? 'text-zinc-400 hover:text-zinc-300' : 'text-gray-600 hover:text-gray-800'}`}>Don't have an account? Sign up</button>
            </form>
          )}
          <button onClick={() => setDarkMode(!darkMode)} className={`mt-6 w-full py-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>&#9790; Toggle Dark Mode</button>
        </div>
      </div>
    );
  }

  const activeTask = allTasks.find(t => t.id === activeTaskId);
  const stats = getStats();
  const analytics = getAnalytics();

  // Main app shell
  return (
    <div className={`h-screen flex ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
      <NavRail activePage={activePage} setActivePage={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} onSignOut={handleSignOut} />

      <div className={`flex-1 flex flex-col min-h-0 ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        {activePage === 'tasks' && (
          <TasksPage
            darkMode={darkMode} currentTime={currentTime} formatClock={formatClock} formatDate={formatDate}
            todayTasks={todayTasks} yesterdayTasks={yesterdayTasks} backlogTasks={backlogTasks} favorites={favorites} trashed={trashed}
            showYesterdayTasks={showYesterdayTasks}
            addTask={addTask} addBacklogTask={addBacklogTask} deleteTask={deleteTask} editTask={editTask}
            toggleTaskComplete={toggleTaskComplete} toggleFavorite={toggleFavorite} isFavorited={isFavorited}
            handleStartClick={handleStartClick} activeTaskId={activeTaskId}
            handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDragEnd={handleDragEnd} handleDrop={handleDrop}
            draggedTask={draggedTask} dragOverTask={dragOverTask}
            addYesterdayTaskToToday={addYesterdayTaskToToday} addAllYesterdayTasks={addAllYesterdayTasks} dismissYesterdayTasks={dismissYesterdayTasks}
            promoteToToday={promoteToToday} restoreTask={restoreTask} permanentlyDelete={permanentlyDelete} clearAllTrashed={clearAllTrashed}
            addTaskFromFavorite={addTaskFromFavorite} addAllFavorites={addAllFavorites} deleteFavorite={deleteFavorite}
          />
        )}
        {activePage === 'calendar' && (
          <CalendarPage
            darkMode={darkMode} allTasks={allTasks} backlogTasks={backlogTasks} user={user}
            getWeekDays={getWeekDays} currentWeekStart={currentWeekStart} nextWeek={nextWeek} prevWeek={prevWeek} goToToday={goToToday}
            getScheduledTasksForDay={getScheduledTasksForDay} getUnscheduledTasksForDay={getUnscheduledTasksForDay}
            createScheduledTask={createScheduledTask} scheduleTask={scheduleTask} editTask={editTask} deleteTask={deleteTask} updateTaskDuration={updateTaskDuration}
          />
        )}
        {activePage === 'analytics' && (
          <AnalyticsPage darkMode={darkMode} analytics={analytics} stats={stats} />
        )}
        {activePage === 'history' && (
          <HistoryPage darkMode={darkMode} groupTasksByDate={groupTasksByDate} />
        )}
        {activePage === 'notes' && (
          <NotesPage darkMode={darkMode} user={user} />
        )}
      </div>

      <FloatingTimer
        darkMode={darkMode} activeTask={activeTask}
        showTimeSetup={showTimeSetup} selectedTask={allTasks.find(t => t.id === selectedTaskId)}
        hours={hours} setHours={setHours} minutes={minutes} setMinutes={setMinutes} seconds={seconds} setSeconds={setSeconds}
        startTimer={startTimer} cancelSetup={() => { setShowTimeSetup(false); setSelectedTaskId(null); }}
        pauseTimer={pauseTimer} resumeTimer={resumeTimer} completeTask={completeTask} repeatTask={repeatTask}
        isRunning={isRunning} timerComplete={timerComplete} timeRemaining={timeRemaining} initialTime={initialTime}
        formatTime={formatTime} getCircleProgress={getCircleProgress}
      />
    </div>
  );
}
