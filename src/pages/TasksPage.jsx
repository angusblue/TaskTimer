import React, { useState } from 'react';
import { ChevronRight, ChevronUp, X, Star } from 'lucide-react';
import TaskRow from '../components/TaskRow';

export default function TasksPage({
  darkMode, currentTime, formatClock, formatDate,
  todayTasks, yesterdayTasks, backlogTasks, favorites, trashed,
  showYesterdayTasks,
  addTask, addBacklogTask, deleteTask, editTask, toggleTaskComplete, toggleFavorite, isFavorited,
  handleStartClick, activeTaskId,
  handleDragStart, handleDragOver, handleDragEnd, handleDrop, draggedTask, dragOverTask,
  addYesterdayTaskToToday, addAllYesterdayTasks, dismissYesterdayTasks,
  promoteToToday, restoreTask, permanentlyDelete, clearAllTrashed,
  addTaskFromFavorite, addAllFavorites, deleteFavorite,
}) {
  const [trashedOpen, setTrashedOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [backlogText, setBacklogText] = useState('');

  const handleAddBacklog = () => { if (backlogText.trim()) { addBacklogTask(backlogText); setBacklogText(''); } };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <div className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatClock(currentTime)}</div>
          <h1 className={`text-2xl font-light ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{formatDate(new Date())}</h1>
        </div>
      </div>

      {/* Task List */}
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
                <button onClick={addAllYesterdayTasks} className={`text-xs px-3 py-1 rounded font-medium transition-colors ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Add All</button>
                <button onClick={dismissYesterdayTasks} className={`text-xs px-3 py-1 rounded transition-colors ${darkMode ? 'text-zinc-500 hover:bg-zinc-700' : 'text-gray-500 hover:bg-gray-200'}`}>Move to Backlog</button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {yesterdayTasks.map(task => (
                <div key={task.id} className={`px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${darkMode ? 'hover:bg-zinc-700 border-b border-zinc-700 last:border-b-0' : 'hover:bg-gray-200 border-b border-gray-300 last:border-b-0'}`} onClick={() => addYesterdayTaskToToday(task)}>
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${darkMode ? 'border-zinc-500' : 'border-gray-400'}`} />
                  <span className={`flex-1 text-sm ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{task.text}</span>
                  <ChevronRight size={16} className={darkMode ? 'text-zinc-500' : 'text-gray-400'} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
          {todayTasks.map(task => (
            <TaskRow
              key={task.id} task={task} darkMode={darkMode}
              isActive={task.id === activeTaskId} onStartClick={handleStartClick}
              onDelete={deleteTask} onToggleComplete={toggleTaskComplete}
              onToggleFavorite={toggleFavorite} isFavorited={isFavorited(task.text)}
              showBorder={true} onEdit={editTask}
              onDragStart={handleDragStart} onDragOver={handleDragOver}
              onDragEnd={handleDragEnd} onDrop={handleDrop}
              isDragging={draggedTask?.id === task.id} isDragOver={dragOverTask?.id === task.id}
            />
          ))}
          <TaskRow darkMode={darkMode} onAdd={addTask} isNew={true} showBorder={todayTasks.length > 0} />
        </div>

        {/* Floating Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={() => { setTrashedOpen(!trashedOpen); setBacklogOpen(false); setFavoritesOpen(false); }} className={`p-3 rounded-full shadow-lg transition-all ${trashedOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button onClick={() => { setBacklogOpen(!backlogOpen); setFavoritesOpen(false); setTrashedOpen(false); }} className={`p-3 rounded-full shadow-lg transition-all ${backlogOpen ? 'bg-blue-500 text-white' : darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
              <line x1="4" y1="6" x2="4.01" y2="6"/><line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/>
            </svg>
          </button>
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
                  <button onClick={clearAllTrashed} className={`text-xs px-3 py-1 rounded hover:opacity-70 transition-colors ${darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-500'}`}>Clear All</button>
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
              <div className={`px-4 py-3 border-t flex items-center gap-2 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                <input type="text" placeholder="Add to backlog" value={backlogText} onChange={(e) => setBacklogText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddBacklog()} className={`flex-1 text-sm bg-transparent border-none outline-none ${darkMode ? 'text-zinc-100 placeholder-zinc-600' : 'text-gray-800 placeholder-gray-400'}`} />
              </div>
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
                  {favorites.length > 0 && <button onClick={() => { addAllFavorites(); setFavoritesOpen(false); }} className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Add All</button>}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {favorites.length === 0 ? (
                  <div className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>No favorites yet. Star a task to add it here!</div>
                ) : (
                  favorites.map(fav => (
                    <div key={fav.id} className={`w-full px-4 py-3 flex items-center gap-2 transition-colors border-b last:border-b-0 ${darkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <button onClick={() => { addTaskFromFavorite(fav); setFavoritesOpen(false); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
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
  );
}
