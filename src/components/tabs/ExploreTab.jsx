import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function ExploreTab({ events, onRegister, loading, error }) {
  const [registering, setRegistering] = useState('')
  const [ticketToken, setTicketToken] = useState('')
  const [ticketEventTitle, setTicketEventTitle] = useState('')

  const activeEvents = events.filter(e => e.status !== 'completed')

  async function handleRegister(eventId, eventTitle) {
    setRegistering(eventId)
    try {
      const data = await onRegister(eventId)
      if (data?.token) {
        setTicketToken(data.token)
        setTicketEventTitle(eventTitle)
      }
    } finally {
      setRegistering('')
    }
  }

  if (ticketToken) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center animate-[fadeIn_0.6s_ease-out_backwards]">
        <button
          onClick={() => setTicketToken('')}
          className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to events
        </button>
        <div className="mb-4">
          <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">Your Entry Ticket</h2>
          <p className="m-0 mt-1 text-[13px] font-medium text-gray-500">{ticketEventTitle}</p>
        </div>
        <div className="flex justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] mb-4 mx-auto max-w-[280px]">
          <QRCodeSVG value={ticketToken} size={220} className="w-full h-auto" />
        </div>
        <p className="m-0 mt-4 text-[13px] font-bold uppercase tracking-wider text-gray-400">
          Show this code at entry
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-[22px] sm:text-[24px] font-bold text-gray-900 tracking-tight">Explore events</h2>
        <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold text-gray-500 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] uppercase tracking-wider">
          {activeEvents.length} available
        </span>
      </div>

      {error && (
        <p className="m-0 text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-[fadeIn_0.3s_ease-out]">
          {error}
        </p>
      )}

      {activeEvents.length === 0 && (
        <div className="text-center py-12 text-[14px] font-medium text-gray-400 bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
          No events available right now.
        </div>
      )}

      {activeEvents.map((event) => {
        const eventDate = new Date(event.date)
        const isPast = eventDate < new Date()
        const sold = event.sold || 0
        const remaining = event.capacity - sold
        const fillPct = event.capacity > 0 ? (sold / event.capacity) * 100 : 0
        return (
          <div
            key={event._id}
            className="bg-white rounded-[20px] border border-gray-100 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all md:hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:hover:border-gray-200"
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="m-0 text-[16px] sm:text-[18px] font-bold text-gray-900 leading-snug">{event.title}</h3>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                isPast
                  ? 'text-amber-600 bg-amber-50 border-amber-100'
                  : 'text-green-600 bg-green-50 border-green-100'
              }`}>
                {isPast ? 'Started' : 'Upcoming'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-3">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {event.location}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-bold text-gray-500">
                  {sold} / {event.capacity} registered
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${remaining <= 0 ? 'text-red-500' : remaining <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                  {remaining <= 0 ? 'Sold out' : `${remaining} left`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${fillPct >= 100 ? 'bg-red-400' : fillPct >= 80 ? 'bg-amber-400' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => handleRegister(event._id, event.title)}
              disabled={loading || registering === event._id || remaining <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-full border-0 px-5 py-3 text-[14px] font-bold bg-gray-900 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] md:hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {registering === event._id ? (
                <span className="inline-block w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : remaining <= 0 ? (
                'Sold Out'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  Get Ticket
                </>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
