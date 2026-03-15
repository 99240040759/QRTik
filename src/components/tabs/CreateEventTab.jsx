import { useState } from 'react'

export function CreateEventTab({ onCreateEvent, loading, error }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!title || !date || !capacity || !location) return
    await onCreateEvent({ title, date, capacity: Number(capacity), location })
    setTitle('')
    setDate('')
    setCapacity('')
    setLocation('')
  }

  return (
    <form
      className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
      onSubmit={handleCreate}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-[22px] sm:text-[24px] font-bold text-gray-900 tracking-tight">Create event</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Title</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Launch Night"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Date & time</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Capacity</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="100"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Location</span>
          <input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Main Hall"
          />
        </label>
      </div>

      {error && (
        <p className="m-0 mb-5 text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-[fadeIn_0.3s_ease-out]">
          {error}
        </p>
      )}

      <button
        className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-full border-0 px-6 py-4 text-[15px] font-bold bg-gray-900 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] md:hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="inline-block w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : 'Create event'}
      </button>
    </form>
  )
}
