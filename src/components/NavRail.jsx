import React from 'react';
import { Calendar, Star, LogOut } from 'lucide-react';

export default function NavRail({ activePage, setActivePage, darkMode, setDarkMode, onSignOut }) {
  const navItems = [
    { id: 'tasks', label: 'Tasks', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    )},
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
    { id: 'history', label: 'History', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    )},
    { id: 'notes', label: 'Notes', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )},
  ];

  return (
    <div className={`w-16 flex flex-col items-center py-4 border-r flex-shrink-0 ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'}`}>
      {/* Logo */}
      <div className={`mb-6 text-lg font-bold ${darkMode ? 'text-zinc-100' : 'text-gray-800'}`}>T</div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activePage === item.id
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="text-[9px] leading-none">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Toggle dark mode"
        >
          <span className="text-base">&#9790;</span>
        </button>
        <button
          onClick={onSignOut}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
