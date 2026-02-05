import React, { useState, useEffect, useRef } from 'react';
import { Play, Check, Pause, X, ChevronRight, Star, ChevronUp, LogOut, Calendar } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function TaskTimer() {
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('magic'); // 'magic' or 'password'
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
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);
  const [showYesterdayTasks, setShowYesterdayTasks] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [creatingTaskAt, setCreatingTaskAt] = useState(null); // { date, hour }
  const [newTaskText, setNewTaskText] = useState('');
  const [resizingTask, setResizingTask] = useState(null);
  const [resizeDuration, setResizeDuration] = useState(null);
  const resizeStartRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(now.setDate(diff));
  });

  // Check auth status on mount
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

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      loadTasks();
      loadFavorites();
      loadTrashed();
    }
  }, [user]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading tasks:', error);
    } else {
      // Sort by order_position if it exists, otherwise by created_at
      const sorted = (data || []).sort((a, b) => {
        if (a.order_position != null && b.order_position != null) {
          return a.order_position - b.order_position;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setAllTasks(sorted);
    }
  };

  const loadFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading favorites:', error);
    } else {
      setFavorites(data || []);
    }
  };

  const loadTrashed = async () => {
    const { data, error } = await supabase
      .from('trashed')
      .select('*')
      .order('trashed_at', { ascending: false });
    
    if (error) {
      console.error('Error loading trashed:', error);
    } else {
      setTrashed(data || []);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://task-timer-dun-phi.vercel.app'
      }
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Check your email for the magic link!');
      setEmail('');
    }
  };

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  const handlePasswordSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://task-timer-dun-phi.vercel.app'
      }
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Account created! Check your email to confirm.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAllTasks([]);
    setFavorites([]);
    setTrashed([]);
  };

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
  }, []);

  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

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

  const todayTasks = allTasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString() && !t.is_backlog);
  const backlogTasks = allTasks.filter(t => t.is_backlog);
  
  const getYesterdayTasks = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return allTasks.filter(t => 
      new Date(t.date).toDateString() === yesterday.toDateString() && 
      !t.completed && 
      !t.is_backlog
    );
  };
  
  const yesterdayTasks = getYesterdayTasks();

  const addTask = async (text) => {
    if (!text.trim() || !user) return;
    
    // Get max order position for today's tasks
    const todayTasksOrdered = allTasks
      .filter(t => new Date(t.date).toDateString() === new Date().toDateString() && !t.is_backlog)
      .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
    const maxOrder = todayTasksOrdered.length > 0 
      ? Math.max(...todayTasksOrdered.map(t => t.order_position || 0))
      : 0;
    
    const newTask = {
      user_id: user.id,
      text,
      completed: false,
      time_spent: 0,
      is_backlog: false,
      date: new Date().toISOString(),
      order_position: maxOrder + 1
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select();

    if (error) {
      console.error('Error adding task:', error);
    } else if (data) {
      setAllTasks(prev => [...prev, data[0]]);
    }
  };

  const addBacklogTask = async (text) => {
    if (!text.trim() || !user) return;
    
    const newTask = {
      user_id: user.id,
      text,
      completed: false,
      time_spent: 0,
      is_backlog: true,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select();

    if (error) {
      console.error('Error adding backlog task:', error);
    } else if (data) {
      setAllTasks(prev => [data[0], ...prev]);
    }
  };

  const promoteToToday = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_backlog: false, date: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error promoting task:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_backlog: false, date: new Date().toISOString() } : t));
    }
  };

  const deleteTask = async (taskId) => {
    if (activeTaskId === taskId) { 
      setActiveTaskId(null); 
      setTimeRemaining(0); 
      setIsRunning(false); 
      setTimerComplete(false); 
      stopRepeatingSound(); 
    }
    if (selectedTaskId === taskId) { 
      setSelectedTaskId(null); 
      setShowTimeSetup(false); 
    }

    const task = allTasks.find(t => t.id === taskId);
    if (task && user) {
      // Move to trashed table
      const { error: trashedError } = await supabase
        .from('trashed')
        .insert([{
          user_id: user.id,
          text: task.text,
          completed: task.completed,
          time_spent: task.time_spent,
          is_backlog: task.is_backlog,
          date: task.date,
          trashed_at: new Date().toISOString()
        }]);

      if (trashedError) {
        console.error('Error moving to trash:', trashedError);
        return;
      }

      // Delete from tasks table
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
      } else {
        setAllTasks(curr => curr.filter(t => t.id !== taskId));
        await loadTrashed();
      }
    }
  };

  const restoreTask = async (trashedTask) => {
    if (!user) return;

    const { error: restoreError } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        text: trashedTask.text,
        completed: trashedTask.completed,
        time_spent: trashedTask.time_spent,
        is_backlog: trashedTask.is_backlog,
        date: trashedTask.date
      }]);

    if (restoreError) {
      console.error('Error restoring task:', restoreError);
      return;
    }

    const { error } = await supabase
      .from('trashed')
      .delete()
      .eq('id', trashedTask.id);

    if (error) {
      console.error('Error removing from trash:', error);
    } else {
      await loadTasks();
      await loadTrashed();
    }
  };

  const permanentlyDelete = async (trashedId) => {
    const { error } = await supabase
      .from('trashed')
      .delete()
      .eq('id', trashedId);

    if (error) {
      console.error('Error permanently deleting:', error);
    } else {
      setTrashed(prev => prev.filter(t => t.id !== trashedId));
    }
  };

  const clearAllTrashed = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('trashed')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing trash:', error);
    } else {
      setTrashed([]);
    }
  };

  const handleStartClick = (taskId) => { 
    setSelectedTaskId(taskId); 
    setShowTimeSetup(true); 
    setHours('00'); 
    setMinutes('00'); 
    setSeconds('00'); 
  };

  const startTimer = () => {
    const total = (parseInt(hours)||0)*3600 + (parseInt(minutes)||0)*60 + (parseInt(seconds)||0);
    if (total > 0) { 
      setActiveTaskId(selectedTaskId); 
      setTimeRemaining(total); 
      setInitialTime(total); 
      setIsRunning(true); 
      setShowTimeSetup(false); 
      setSelectedTaskId(null); 
    }
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => { if (timeRemaining > 0) setIsRunning(true); };

  const completeTask = async () => {
    stopRepeatingSound();
    playCompletionSound();
    const spent = initialTime - timeRemaining;
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        completed: true, 
        time_spent: allTasks.find(t => t.id === activeTaskId)?.time_spent + spent 
      })
      .eq('id', activeTaskId);

    if (error) {
      console.error('Error completing task:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, completed: true, time_spent: (t.time_spent||0) + spent } : t));
    }
    
    setActiveTaskId(null); 
    setTimeRemaining(0); 
    setIsRunning(false); 
    setTimerComplete(false);
  };

  const repeatTask = () => { 
    stopRepeatingSound(); 
    setTimeRemaining(initialTime); 
    setIsRunning(true); 
    setTimerComplete(false); 
  };

  const toggleTaskComplete = async (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling task:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    }
  };

  const editTask = async (taskId, newText) => {
    const { error } = await supabase
      .from('tasks')
      .update({ text: newText })
      .eq('id', taskId);

    if (error) {
      console.error('Error editing task:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t));
    }
  };

  const reorderTasks = async (draggedTaskId, targetTaskId) => {
    const draggedIndex = todayTasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = todayTasks.findIndex(t => t.id === targetTaskId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Create new array with reordered tasks
    const reordered = [...todayTasks];
    const [movedTask] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedTask);
    
    // Update order_position for all affected tasks
    const updates = reordered.map((task, index) => ({
      id: task.id,
      order_position: index
    }));
    
    // Optimistically update UI
    setAllTasks(prev => {
      const otherTasks = prev.filter(t => !todayTasks.find(tt => tt.id === t.id));
      return [...otherTasks, ...reordered.map((t, i) => ({ ...t, order_position: i }))];
    });
    
    // Update database
    for (const update of updates) {
      await supabase
        .from('tasks')
        .update({ order_position: update.order_position })
        .eq('id', update.id);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTask && task.id !== draggedTask.id) {
      setDragOverTask(task);
    }
  };

  const handleDragEnd = () => {
    if (draggedTask && dragOverTask && draggedTask.id !== dragOverTask.id) {
      reorderTasks(draggedTask.id, dragOverTask.id);
    }
    setDraggedTask(null);
    setDragOverTask(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const addYesterdayTaskToToday = async (task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ date: new Date().toISOString() })
      .eq('id', task.id);

    if (error) {
      console.error('Error moving task to today:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, date: new Date().toISOString() } : t));
    }
  };

  const addAllYesterdayTasks = async () => {
    const updates = yesterdayTasks.map(task =>
      supabase
        .from('tasks')
        .update({ date: new Date().toISOString() })
        .eq('id', task.id)
    );

    await Promise.all(updates);
    setAllTasks(prev => prev.map(t => 
      yesterdayTasks.find(yt => yt.id === t.id) 
        ? { ...t, date: new Date().toISOString() } 
        : t
    ));
    setShowYesterdayTasks(false);
  };

  const dismissYesterdayTasks = async () => {
    // Move all yesterday's tasks to backlog
    const updates = yesterdayTasks.map(task =>
      supabase
        .from('tasks')
        .update({ is_backlog: true })
        .eq('id', task.id)
    );

    await Promise.all(updates);
    setAllTasks(prev => prev.map(t => 
      yesterdayTasks.find(yt => yt.id === t.id) 
        ? { ...t, is_backlog: true } 
        : t
    ));
    setShowYesterdayTasks(false);
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  const scheduleTask = async (taskId, scheduledTime) => {
    const { error } = await supabase
      .from('tasks')
      .update({ scheduled_time: scheduledTime })
      .eq('id', taskId);

    if (error) {
      console.error('Error scheduling task:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, scheduled_time: scheduledTime } : t));
    }
  };

  const updateTaskDuration = async (taskId, duration) => {
    const { error } = await supabase
      .from('tasks')
      .update({ scheduled_duration: duration })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task duration:', error);
    } else {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, scheduled_duration: duration } : t));
    }
  };

  const startResize = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    const duration = task.scheduled_duration || 60;
    setResizingTask(task);
    setResizeDuration(duration);
    resizeStartRef.current = {
      startY: e.clientY,
      originalDuration: duration
    };
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

  const getTasksForDay = (date) => {
    return allTasks.filter(t => {
      if (t.is_backlog) return false;
      const taskDate = new Date(t.date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getScheduledTasksForDay = (date) => {
    return getTasksForDay(date).filter(t => t.scheduled_time);
  };

  const getUnscheduledTasksForDay = (date) => {
    return getTasksForDay(date).filter(t => !t.scheduled_time);
  };

  const createScheduledTask = async (text, date, hour) => {
    if (!text.trim() || !user) return;
    
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hour, 0, 0, 0);
    
    // Get max order position for that day's tasks
    const dayTasks = getTasksForDay(date);
    const maxOrder = dayTasks.length > 0 
      ? Math.max(...dayTasks.map(t => t.order_position || 0))
      : 0;
    
    const newTask = {
      user_id: user.id,
      text,
      completed: false,
      time_spent: 0,
      is_backlog: false,
      date: date.toISOString(),
      order_position: maxOrder + 1,
      scheduled_time: scheduledTime.toISOString(),
      scheduled_duration: 60
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select();

    if (error) {
      console.error('Error creating scheduled task:', error);
    } else if (data) {
      setAllTasks(prev => [...prev, data[0]]);
      setCreatingTaskAt(null);
      setNewTaskText('');
    }
  };

  const toggleFavorite = async (task) => {
    if (!user) return;

    const existing = favorites.find(f => f.text === task.text);
    
    if (existing) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Error removing favorite:', error);
      } else {
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, text: task.text }])
        .select();

      if (error) {
        console.error('Error adding favorite:', error);
      } else if (data) {
        setFavorites(prev => [...prev, data[0]]);
      }
    }
  };

  const addTaskFromFavorite = async (fav) => {
    await addTask(fav.text);
    setFavoritesOpen(false);
  };

  const addAllFavorites = async () => {
    for (const fav of favorites) {
      await addTask(fav.text);
    }
    setFavoritesOpen(false);
  };

  const deleteFavorite = async (id, e) => { 
    e.stopPropagation(); 
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting favorite:', error);
    } else {
      setFavorites(prev => prev.filter(f => f.id !== id)); 
    }
  };

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
    let h = date.getHours(); 
    const m = date.getMinutes(); 
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const groupTasksByDate = () => {
    const groups = {};
    allTasks.forEach(t => { 
      const k = new Date(t.date).toDateString(); 
      if (!groups[k]) groups[k] = []; 
      groups[k].push(t); 
    });
    return Object.entries(groups).sort((a,b) => new Date(b[0]) - new Date(a[0]));
  };

  const getStats = () => {
    const completed = allTasks.filter(t => t.completed);
    let streak = 0;
    const today = new Date(); 
    today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); 
      d.setDate(d.getDate() - i);
      if (completed.some(t => new Date(t.date).toDateString() === d.toDateString())) streak++;
      else if (i > 0) break;
    }
    return { totalCompleted: completed.length, streak };
  };

  const getAnalytics = () => {
    const completed = allTasks.filter(t => t.completed);
    const totalSeconds = completed.reduce((s,t) => s + (t.time_spent||0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const avgDuration = completed.length > 0 ? (totalSeconds / completed.length / 60).toFixed(0) : 0;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); 
      d.setDate(d.getDate() - i);
      last7Days.push({ 
        day: d.toLocaleDateString('en',{weekday:'short'})[0], 
        count: completed.filter(t => new Date(t.date).toDateString() === d.toDateString()).length 
      });
    }
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayCounts = {};
    completed.forEach(t => { 
      const d = new Date(t.date).getDay(); 
      dayCounts[d] = (dayCounts[d]||0)+1; 
    });
    const mostProductiveDay = Object.entries(dayCounts).length > 0 ? dayNames[Object.entries(dayCounts).sort((a,b) => b[1]-a[1])[0][0]] : 'N/A';
    const thisWeekStart = new Date(); 
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); 
    thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(thisWeekStart); 
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisWeekCount = completed.filter(t => new Date(t.date) >= thisWeekStart).length;
    const lastWeekCount = completed.filter(t => { 
      const d = new Date(t.date); 
      return d >= lastWeekStart && d < thisWeekStart; 
    }).length;
    return { totalHours, avgDuration, last7Days, mostProductiveDay, thisWeekCount, lastWeekCount };
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
        <div className={`text-xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
        <div className={`w-full max-w-md p-8 rounded-xl ${darkMode ? 'bg-zinc-950' : 'bg-white'} shadow-lg`}>
          <h1 className={`text-3xl font-light mb-2 text-center ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
            TaskTimer
          </h1>
          <p className={`text-sm text-center mb-8 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
            {authMode === 'magic' ? 'Sign in with a magic link' : 'Sign in with password'}
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('magic')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                authMode === 'magic'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                authMode === 'password'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Password
            </button>
          </div>

          {authMode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
                required
              />
              
              {authError && (
                <div className={`text-sm ${authError.includes('Check your email') || authError.includes('created') ? 'text-green-500' : 'text-red-500'}`}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Magic Link
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
                required
              />
              
              {authError && (
                <div className={`text-sm ${authError.includes('Check your email') || authError.includes('created') ? 'text-green-500' : 'text-red-500'}`}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </button>
              
              <button
                type="button"
                onClick={handlePasswordSignUp}
                className={`w-full py-2 rounded-lg text-sm transition-colors ${
                  darkMode
                    ? 'text-zinc-400 hover:text-zinc-300'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Don't have an account? Sign up
              </button>
            </form>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-6 w-full py-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ☾ Toggle Dark Mode
          </button>
        </div>
      </div>
    );
  }

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

            {/* Calendar Button */}
            <button 
              onClick={() => setShowCalendar(true)} 
              className={`w-full mb-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Calendar size={16} />
              Open Calendar View
            </button>

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
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>☾</button>
              <button onClick={handleSignOut} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg relative">
            {/* Yesterday's Unfinished Tasks */}
            {showYesterdayTasks && yesterdayTasks.length > 0 && (
              <div className={`mb-4 rounded-lg overflow-hidden ${darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-300'}`}>
                <div className={`px-4 py-3 flex items-center justify-between ${darkMode ? 'border-b border-zinc-700' : 'border-b border-gray-300'}`}>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-zinc-400' : 'text-gray-500'}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className={`font-medium text-sm ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                      {yesterdayTasks.length} unfinished from yesterday
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addAllYesterdayTasks}
                      className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                        darkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-500' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Add All
                    </button>
                    <button
                      onClick={dismissYesterdayTasks}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        darkMode 
                          ? 'text-zinc-500 hover:bg-zinc-700' 
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Move to Backlog
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {yesterdayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                        darkMode ? 'hover:bg-zinc-700 border-b border-zinc-700 last:border-b-0' : 'hover:bg-gray-200 border-b border-gray-300 last:border-b-0'
                      }`}
                      onClick={() => addYesterdayTaskToToday(task)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${darkMode ? 'border-zinc-500' : 'border-gray-400'}`} />
                      <span className={`flex-1 text-sm ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {task.text}
                      </span>
                      <ChevronRight size={16} className={darkMode ? 'text-zinc-500' : 'text-gray-400'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={darkMode ? 'bg-zinc-900' : 'bg-gray-50'}>
              {todayTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  darkMode={darkMode} 
                  isActive={task.id === activeTaskId} 
                  onStartClick={handleStartClick} 
                  onDelete={deleteTask} 
                  onToggleComplete={toggleTaskComplete} 
                  onToggleFavorite={toggleFavorite} 
                  isFavorited={isFavorited(task.text)} 
                  showBorder={true} 
                  onEdit={editTask}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  isDragging={draggedTask?.id === task.id}
                  isDragOver={dragOverTask?.id === task.id}
                />
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
                        const daysLeft = Math.ceil(30 - (new Date() - new Date(task.trashed_at)) / (1000*60*60*24));
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

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCalendar(false)}>
          <div 
            className={`w-[95vw] h-[90vh] rounded-lg shadow-2xl flex flex-col ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <h2 className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                  Week of {currentWeekStart.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevWeek} className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <button onClick={goToToday} className={`px-3 py-1 text-sm rounded transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    Today
                  </button>
                  <button onClick={nextWeek} className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button onClick={() => setShowCalendar(false)} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                <X size={24} />
              </button>
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

                {/* Time Grid */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-8" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                    {/* Time column + Day columns */}
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <React.Fragment key={hour}>
                        {/* Time label */}
                        <div className={`h-16 p-2 text-right text-xs border-r border-b ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-200 text-gray-500'}`}>
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                        
                        {/* Day cells */}
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
                                    type="text"
                                    autoFocus
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        createScheduledTask(newTaskText, day, hour);
                                      } else if (e.key === 'Escape') {
                                        setCreatingTaskAt(null);
                                        setNewTaskText('');
                                      }
                                    }}
                                    onBlur={() => {
                                      if (newTaskText.trim()) {
                                        createScheduledTask(newTaskText, day, hour);
                                      } else {
                                        setCreatingTaskAt(null);
                                      }
                                    }}
                                    placeholder="Task name..."
                                    className={`w-full text-xs bg-transparent border-none outline-none ${darkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-gray-800 placeholder-gray-400'}`}
                                  />
                                </div>
                              ) : (
                                tasksInHour.map(task => {
                                  const isResizing = resizingTask?.id === task.id;
                                  const duration = isResizing ? resizeDuration : (task.scheduled_duration || 60);
                                  const taskHeight = (duration / 60) * 64 - 4;
                                  const startTime = new Date(task.scheduled_time);
                                  const endTime = new Date(startTime.getTime() + duration * 60000);
                                  const formatTime = (d) => d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });

                                  return (
                                    <div
                                      key={task.id}
                                      draggable={!isResizing}
                                      onDragStart={(e) => {
                                        if (isResizing) { e.preventDefault(); return; }
                                        e.dataTransfer.setData('taskId', task.id.toString());
                                      }}
                                      className={`absolute inset-x-1 top-1 p-1 text-xs rounded group select-none ${
                                        isResizing ? 'ring-2 ring-blue-400 shadow-lg' : 'cursor-move'
                                      } ${
                                        darkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                      }`}
                                      style={{
                                        height: `${Math.max(taskHeight, 12)}px`,
                                        zIndex: isResizing ? 30 : 10,
                                        userSelect: 'none'
                                      }}
                                    >
                                      <div className="truncate font-medium">{task.text}</div>
                                      <div className="text-[10px] opacity-70">
                                        {formatTime(startTime)} – {formatTime(endTime)}
                                      </div>
                                      {duration >= 45 && (
                                        <div className="text-[10px] opacity-50 mt-0.5">
                                          {duration >= 60 ? `${Math.floor(duration / 60)}h` : ''}{duration % 60 ? `${duration % 60}m` : ''}
                                        </div>
                                      )}
                                      {/* Resize handle */}
                                      <div
                                        className={`absolute bottom-0 left-1 right-1 h-2 cursor-s-resize rounded-b flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                                          darkMode ? 'hover:bg-blue-700/50' : 'hover:bg-blue-200/80'
                                        }`}
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

                {/* Unscheduled tasks row */}
                <div className={`border-t ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="grid grid-cols-8 p-2" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                    <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-500'} self-center`}>Unscheduled</div>
                    {getWeekDays().map((day, i) => (
                      <div key={i} className="px-2 space-y-1 max-h-24 overflow-y-auto">
                        {getUnscheduledTasksForDay(day).map(task => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
                            className={`text-xs p-1 rounded cursor-move truncate ${
                              darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                          >
                            {task.text}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Backlog Panel */}
              <div className={`w-64 border-l ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <h3 className={`font-medium ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>Backlog</h3>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto h-full">
                  {backlogTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id.toString());
                        e.dataTransfer.setData('fromBacklog', 'true');
                      }}
                      className={`text-sm p-2 rounded cursor-move ${
                        darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {task.text}
                    </div>
                  ))}
                  {backlogTasks.length === 0 && (
                    <div className={`text-sm text-center py-8 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                      No backlog tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
              {task.time_spent > 0 && <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>{(task.time_spent/60).toFixed(0)}m</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, darkMode, isActive, onStartClick, onDelete, onToggleComplete, onToggleFavorite, isFavorited, onAdd, isNew, showBorder, onEdit, onDragStart, onDragOver, onDragEnd, onDrop, isDragging, isDragOver }) {
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
    <div 
      draggable={!task.completed && !isActive && !editing}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragOver={(e) => onDragOver && onDragOver(e, task)}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`px-4 py-3 flex items-center gap-3 transition-colors ${showBorder ? (darkMode ? 'border-b border-zinc-800' : 'border-b border-gray-200') : ''} ${
        isDragging ? 'opacity-50' : ''
      } ${
        isDragOver ? (darkMode ? 'border-t-2 border-t-blue-500' : 'border-t-2 border-t-blue-500') : ''
      } ${
        isActive ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : (darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100')
      } ${
        !task.completed && !isActive && !editing ? 'cursor-move' : ''
      }`}
    >
      {!task.completed && !isActive && !editing && (
        <div className={`mr-2 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </div>
      )}
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