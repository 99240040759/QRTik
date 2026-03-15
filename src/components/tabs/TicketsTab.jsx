import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function TicketsTab({ myTickets }) {
  const [selectedTicketToken, setSelectedTicketToken] = useState('')

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">Your registered events</h2>
      </div>

      <div className="flex flex-col gap-3">
        {myTickets.map(({ ticket, event, token: thisToken }) => {
          const isSelected = selectedTicketToken === thisToken
          return (
            <div
              key={ticket._id}
              className={`group flex justify-between items-center gap-3 p-4 sm:p-5 rounded-[16px] cursor-pointer transition-all border ${
                isSelected ? 'border-gray-900 shadow-sm bg-white' : 'bg-gray-50 border-transparent md:hover:border-gray-200 md:hover:bg-white md:hover:shadow-sm'
              }`}
              onClick={() => setSelectedTicketToken(isSelected ? '' : thisToken)}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-start w-full">
                  <div className="text-[15px] sm:text-base font-bold text-gray-900">{event?.title || 'Unknown Event'}</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {ticket.isScanned ? (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">Scanned</span>
                    ) : (
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-500">Active</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] font-medium text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {event?.date ? new Date(event.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event?.location || 'N/A'}
                  </span>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex justify-center w-full ${isSelected ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                      <QRCodeSVG value={thisToken} size={180} />
                    </div>
                    <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Show code at entry</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {myTickets.length === 0 && (
          <div className="text-center py-8 text-[14px] font-medium text-gray-400 bg-gray-50 rounded-[16px] border border-dashed border-gray-200">
            No tickets yet. Register above!
          </div>
        )}
      </div>
    </div>
  )
}
