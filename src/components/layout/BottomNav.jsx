const tabs = [
  {
    id: 'explore',
    label: 'Explore',
    icon: (active) => (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: (active) => (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )
  },
  {
    id: 'create',
    label: 'Create',
    icon: (active) => (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  {
    id: 'manage',
    label: 'Manage',
    icon: (active) => (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'scan',
    label: 'Scan',
    icon: (active) => (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    )
  }
]

export function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex overflow-x-auto justify-start sm:justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-50 transition-all hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex min-w-[72px] flex-col items-center justify-center p-2 flex-1 rounded-2xl transition-all ${
            activeTab === tab.id ? 'text-gray-900 bg-gray-100/50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab.icon(activeTab === tab.id)}
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
