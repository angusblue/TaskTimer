import React, { useState, useRef } from 'react';
import { Play, Check, X, Star } from 'lucide-react';

export default function TaskRow({ task, darkMode, isActive, onStartClick, onDelete, onToggleComplete, onToggleFavorite, isFavorited, onAdd, isNew, showBorder, onEdit, onDragStart, onDragOver, onDragEnd, onDrop, isDragging, isDragOver }) {
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
        {task.scheduled_time && (() => {
          const start = new Date(task.scheduled_time);
          const end = new Date(start.getTime() + (task.scheduled_duration || 60) * 60000);
          const fmt = (d) => d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
          return <div className="text-xs text-blue-400 mt-0.5">{fmt(start)} – {fmt(end)}</div>;
        })()}
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
