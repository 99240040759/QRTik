import { ProfileDropdown } from '../ProfileDropdown'

export function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-[8px] bg-gray-900 shadow-sm flex items-center justify-center text-white text-xs font-bold leading-none">
          Q
        </span>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-gray-900 leading-tight">QRTik</span>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">Event tickets & scans</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {user && (
          <ProfileDropdown user={user} onLogout={onLogout} />
        )}
      </div>
    </header>
  )
}
