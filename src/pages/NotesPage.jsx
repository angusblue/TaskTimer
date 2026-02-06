import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function NotesPage({ darkMode, user }) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Load notes
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) {
        setNotes(data);
        if (data.length > 0 && !activeNoteId) setActiveNoteId(data[0].id);
      }
    };
    load();
  }, [user]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Autosave with debounce
  const autoSave = (noteId, updates) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    // Optimistic local update
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', noteId);
      setSaving(false);
    }, 500);
  };

  const handleTitleChange = (e) => {
    if (!activeNote) return;
    autoSave(activeNote.id, { title: e.target.value });
  };

  const handleContentChange = (e) => {
    if (!activeNote) return;
    autoSave(activeNote.id, { content: e.target.value });
  };

  const createNote = async () => {
    if (!user) return;
    const newNote = { user_id: user.id, title: '', content: '', updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('notes').insert([newNote]).select();
    if (!error && data) {
      setNotes(prev => [data[0], ...prev]);
      setActiveNoteId(data[0].id);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  };

  const deleteNote = async (noteId, e) => {
    e.stopPropagation();
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (!error) {
      setNotes(prev => {
        const remaining = prev.filter(n => n.id !== noteId);
        if (activeNoteId === noteId) {
          setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    }
  };

  // Filter notes by search
  const filteredNotes = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  // Sort: most recently updated first
  const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('en', { weekday: 'long' });
    } else {
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }
  };

  const getPreview = (note) => {
    const lines = note.content.split('\n').filter(l => l.trim());
    return lines.length > 0 ? lines[0].slice(0, 80) : 'No additional text';
  };

  // Handle Tab key in content area for indentation
  const handleContentKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '\t' + value.substring(end);
      autoSave(activeNote.id, { content: newValue });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Note List Sidebar */}
      <div className={`w-72 flex flex-col border-r flex-shrink-0 ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50/80 border-gray-200'}`}>
        {/* Search + New */}
        <div className={`p-3 flex items-center gap-2 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
          <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-gray-200/70'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-zinc-500' : 'text-gray-400'}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm ${darkMode ? 'text-zinc-200 placeholder-zinc-500' : 'text-gray-800 placeholder-gray-400'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className={`${darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={createNote}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'text-yellow-500 hover:bg-zinc-800' : 'text-yellow-600 hover:bg-gray-200'}`}
            title="New Note"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>

        {/* Note count */}
        <div className={`px-4 py-2 text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
          {sortedNotes.length} Note{sortedNotes.length !== 1 ? 's' : ''}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
              {search ? 'No matching notes' : 'No notes yet'}
            </div>
          ) : (
            sortedNotes.map(note => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`px-4 py-3 cursor-pointer border-b transition-colors group ${
                    isActive
                      ? darkMode ? 'bg-yellow-500/10 border-zinc-800' : 'bg-yellow-50 border-gray-200'
                      : darkMode ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold text-sm truncate ${
                        isActive
                          ? darkMode ? 'text-zinc-100' : 'text-gray-900'
                          : darkMode ? 'text-zinc-200' : 'text-gray-800'
                      }`}>
                        {note.title || 'New Note'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                          {formatDate(note.updated_at)}
                        </span>
                        <span className={`text-xs truncate ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                          {getPreview(note)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${darkMode ? 'hover:bg-zinc-700 text-zinc-500' : 'hover:bg-gray-200 text-gray-400'}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Editor */}
      <div className={`flex-1 flex flex-col min-h-0 ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        {activeNote ? (
          <>
            {/* Editor toolbar */}
            <div className={`px-6 py-2 flex items-center justify-between border-b flex-shrink-0 ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              <div className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                {formatDate(activeNote.updated_at)}
                {saving && <span className="ml-2">Saving...</span>}
              </div>
              <div className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                {activeNote.content.length > 0 ? `${activeNote.content.split(/\s+/).filter(w => w).length} words` : ''}
              </div>
            </div>

            {/* Title + Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <input
                ref={titleRef}
                type="text"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Title"
                className={`w-full border-none outline-none text-2xl font-bold mb-1 bg-transparent ${darkMode ? 'text-zinc-100 placeholder-zinc-600' : 'text-gray-900 placeholder-gray-300'}`}
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif' }}
              />
              <div className={`text-xs mb-4 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                {new Date(activeNote.updated_at).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
              <textarea
                ref={contentRef}
                value={activeNote.content}
                onChange={handleContentChange}
                onKeyDown={handleContentKeyDown}
                placeholder="Start writing..."
                className={`w-full border-none outline-none resize-none bg-transparent leading-relaxed text-[15px] ${darkMode ? 'text-zinc-300 placeholder-zinc-700' : 'text-gray-700 placeholder-gray-300'}`}
                style={{
                  minHeight: 'calc(100vh - 200px)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
                  tabSize: 4
                }}
              />
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? 'text-zinc-700' : 'text-gray-300'}`}>
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              <p className="text-sm">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
