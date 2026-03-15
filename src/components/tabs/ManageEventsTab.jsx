import { useState } from 'react'

export function ManageEventsTab({ myCreatedEvents, onDelete, onUpdate, onComplete, loading }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCapacity, setEditCapacity] = useState('')
  const [editLocation, setEditLocation] = useState('')

  function startEdit(event) {
    setEditingId(event._id)
    setEditTitle(event.title)
    if (event.date) {
      const d = new Date(event.date)
      const localParams = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      setEditDate(localParams.toISOString().slice(0, 16))
    } else {
      setEditDate('')
    }
    setEditCapacity(event.capacity || '')
    setEditLocation(event.location || '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!editTitle || !editDate || !editCapacity || !editLocation) return
    await onUpdate(editingId, {
      title: editTitle,
      date: editDate,
      capacity: Number(editCapacity),
      location: editLocation
    })
    setEditingId(null)
  }

  const activeEvents = myCreatedEvents.filter(e => e.status !== 'completed')
  const completedEvents = myCreatedEvents.filter(e => e.status === 'completed')

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">Active events</h2>
          <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold text-gray-500 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] uppercase tracking-wider">
            {activeEvents.length} active
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {activeEvents.map((event) => {
            if (editingId === event._id) {
              return (
                <form key={event._id} onSubmit={handleUpdate} className="flex flex-col gap-3 p-4 sm:p-5 rounded-[16px] bg-white border border-gray-200 shadow-sm animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                      aria-label="Back"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-[14px] font-bold text-gray-900">Editing event</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Event Title"
                    />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                      type="datetime-local"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                      type="number"
                      min="1"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                      placeholder="Capacity"
                    />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 text-[13px] font-bold rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-[13px] font-bold rounded-full bg-gray-900 text-white shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-60"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )
            }
            return (
              <div key={event._id} className="group flex justify-between items-center gap-3 p-4 sm:p-5 rounded-[16px] bg-gray-50 border border-transparent md:hover:border-gray-200 md:hover:bg-white transition-all md:hover:shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] sm:text-base font-bold text-gray-900">{event.title}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 border border-green-100">Active</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {event.location}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <span className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-500 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] tracking-wider">
                    {event.sold || 0}/{event.capacity}
                  </span>
                  <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(event)}
                      className="rounded-full p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      aria-label="Edit event"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onComplete(event._id)}
                      className="rounded-full p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      aria-label="Mark as completed"
                      title="Mark as completed"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(event._id)}
                      className="rounded-full p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Delete event"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {activeEvents.length === 0 && (
            <div className="text-center py-8 text-[14px] font-medium text-gray-400 bg-gray-50 rounded-[16px] border border-dashed border-gray-200">
              No active events.
            </div>
          )}
        </div>
      </div>

      {completedEvents.length > 0 && (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">Completed</h2>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold text-gray-500 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] uppercase tracking-wider">
              {completedEvents.length} done
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {completedEvents.map((event) => (
              <div key={event._id} className="flex justify-between items-center gap-3 p-4 sm:p-5 rounded-[16px] bg-gray-50/60 border border-transparent">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] sm:text-base font-bold text-gray-400 line-through">{event.title}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 border border-gray-200">Completed</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
