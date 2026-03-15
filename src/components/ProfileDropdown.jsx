import { useState, useRef, useEffect } from 'react'

export function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 p-1 sm:pr-3 bg-white text-gray-900 text-[11px] sm:text-[13px] font-semibold md:hover:bg-gray-50 transition-colors"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] sm:text-xs">
          {user.name ? user.name[0]?.toUpperCase() : user.email[0]?.toUpperCase()}
        </span>
        <span className="hidden sm:inline">Profile</span>
        <svg
          className={`hidden sm:block w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-[14px] font-bold text-gray-900 m-0 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-[11px] font-medium text-gray-500 m-0 truncate mt-0.5">
              {user.email}
            </p>
          </div>
          <div className="p-1.5">
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 rounded-xl md:hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
