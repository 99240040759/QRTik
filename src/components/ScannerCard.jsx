import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { apiBase } from '../config'

export function ScannerCard({ myCreatedEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [status, setStatus] = useState('')
  const [tone, setTone] = useState('idle')
  const scannerId = 'qr-scanner'

  const activeEvents = (myCreatedEvents || []).filter(e => e.status !== 'completed')
  const isOrganizer = activeEvents.length > 0

  useEffect(() => {
    if (!selectedEvent || typeof window === 'undefined') return

    const scanner = new Html5QrcodeScanner(scannerId, {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0,
    })

    scanner.render(
      async (text) => {
        try {
          setTone('neutral')
          setStatus('Checking ticket...')
          const res = await fetch(`${apiBase}/api/tickets/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: text })
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            setTone('success')
            setStatus('Valid entry')
          } else {
            setTone('error')
            setStatus(data.message || 'Invalid ticket')
          }
        } catch {
          setTone('error')
          setStatus('Connection error')
        }
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [selectedEvent])

  const toneMap = {
    idle: 'bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]',
    success: 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]',
    error: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    neutral: 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-pulseSlow'
  }

  if (!isOrganizer) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight mb-2">Scanner for Organizers</h2>
          <p className="m-0 text-[14px] font-medium text-gray-500 leading-relaxed max-w-[320px] mx-auto mb-6">
            Create an event to unlock the QR scanner. As an organizer, you can scan attendee tickets at the entrance for quick verification.
          </p>
          <div className="flex flex-col gap-3 max-w-[280px] mx-auto text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">1</span>
              <span className="text-[13px] font-medium text-gray-600">Create an event in the Create tab</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">2</span>
              <span className="text-[13px] font-medium text-gray-600">Attendees register and get QR tickets</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">3</span>
              <span className="text-[13px] font-medium text-gray-600">Come back here to scan tickets at the door</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedEvent) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setSelectedEvent(null); setStatus(''); setTone('idle') }}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            aria-label="Back to events"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="m-0 text-[18px] sm:text-[20px] font-bold text-gray-900 tracking-tight leading-tight">{selectedEvent.title}</h2>
            <p className="m-0 text-[12px] font-medium text-gray-500">Scanning tickets</p>
          </div>
        </div>

        <div
          id={scannerId}
          className="w-full rounded-[16px] overflow-hidden border border-gray-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] bg-gray-50 [&>div]:!border-0"
        />

        <div className="flex items-center justify-center gap-3 mt-6 text-[14px] font-bold py-3.5 px-4 bg-gray-50 rounded-full border border-gray-100 uppercase tracking-wide text-gray-700">
          <div className={`w-3 h-3 rounded-full ${toneMap[tone] || toneMap.idle}`} />
          <span>{status || 'Aim camera at QR'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">Scan tickets</h2>
        <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold text-gray-500 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] uppercase tracking-wider">
          {activeEvents.length} {activeEvents.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <p className="m-0 text-[13px] font-medium text-gray-500">Select an event to start scanning entry tickets.</p>

      {activeEvents.map((event) => {
        const eventDate = new Date(event.date)
        return (
          <button
            key={event._id}
            onClick={() => setSelectedEvent(event)}
            className="w-full text-left bg-white rounded-[20px] border border-gray-100 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all md:hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:hover:border-gray-200 active:scale-[0.98]"
          >
            <div className="flex justify-between items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] sm:text-[16px] font-bold text-gray-900">{event.title}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
