import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export function AuthPanel({ user, setUser, token, setToken }) {
  const { request, loading, error } = useApi(token)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password || (mode === 'register' && !name)) return
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
    const body = mode === 'register'
      ? { name, email, password }
      : { email, password }
    const data = await request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    setUser(data.user)
    setToken(data.token)
    window.localStorage.setItem(
      'pulseEntryAuth',
      JSON.stringify({ token: data.token, user: data.user })
    )
  }

  if (user) {
    return (
      <div className="bg-transparent border border-dashed border-gray-300 rounded-[20px] p-5 sm:p-6 transition-all">
        <div className="flex justify-between items-center mb-0">
          <h2 className="m-0 text-lg sm:text-[20px] font-bold text-gray-900">Signed In</h2>
          <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] sm:text-xs font-semibold text-gray-500 bg-white shadow-sm">
            {user.email}
          </span>
        </div>
      </div>
    )
  }

  return (
    <form className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]" onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-[22px] sm:text-[24px] font-bold text-gray-900 tracking-tight">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
      </div>

      {mode === 'register' && (
        <div className="mb-4">
          <label className="block">
            <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Name</span>
            <input
              className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </label>
        </div>
      )}

      <div className="mb-4">
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Email</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="mb-5">
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Password</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
      </div>

      {error && (
        <p className="m-0 mb-5 text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-[fadeIn_0.3s_ease-out]">
          {error}
        </p>
      )}

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          className={`rounded-full border border-transparent px-4 py-2.5 text-[13px] font-bold transition-all ${
            mode === 'login'
              ? 'bg-gray-100 text-gray-900'
              : 'bg-transparent text-gray-400 hover:bg-gray-50 md:hover:text-gray-600'
          }`}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-full border border-transparent px-4 py-2.5 text-[13px] font-bold transition-all ${
            mode === 'register'
              ? 'bg-gray-100 text-gray-900'
              : 'bg-transparent text-gray-400 hover:bg-gray-50 md:hover:text-gray-600'
          }`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <button
        className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-full border-0 px-6 py-4 text-[15px] font-bold bg-gray-900 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.2)] md:hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 disabled:shadow-none"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="inline-block w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : (
          mode === 'login' ? 'Continue' : 'Create account'
        )}
      </button>
    </form>
  )
}
