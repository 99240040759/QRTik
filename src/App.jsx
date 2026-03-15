import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/Dashboard'
import { AuthPanel } from './components/AuthPanel'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem('pulseEntryAuth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed.user || null)
        setToken(parsed.token || '')
      } catch {
        window.localStorage.removeItem('pulseEntryAuth')
      }
    }
  }, [])

  function handleLogout() {
    setUser(null)
    setToken('')
    window.localStorage.removeItem('pulseEntryAuth')
  }

  return (
    <div className="flex flex-col min-h-screen animate-[fadeIn_0.6s_ease-out_backwards]">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1 w-full max-w-[640px] px-4 py-6 sm:py-8 sm:px-0 mx-auto flex flex-col gap-5 sm:gap-6">
        {!user ? (
          <AuthPanel user={user} setUser={setUser} token={token} setToken={setToken} />
        ) : (
          <Dashboard user={user} token={token} />
        )}
      </main>
    </div>
  )
}

export default App
