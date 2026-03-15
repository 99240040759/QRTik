import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { apiBase } from '../config'

export function ScannerCard({ myCreatedEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [status, setStatus] = useState('')
  const [tone, setTone] = useState('idle')
  const scannerId = 'qr-scanner'
  
  const isProcessingRef = useRef(false)
  const lastScannedRef = useRef({ text: null, time: 0 })

  const activeEvents = (myCreatedEvents || []).filter(e => e.status !== 'completed')
  const isOrganizer = activeEvents.length > 0

  const [scanMode, setScanMode] = useState('camera') // 'camera' or 'file'
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    if (!selectedEvent || typeof window === 'undefined') return

    // Reset refs on load
    isProcessingRef.current = false
    lastScannedRef.current = { text: null, time: 0 }

    if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerId)
    }
    const html5QrCode = html5QrCodeRef.current

    // Helper logic to process a scanned token (from camera or file)
    const processScan = async (text) => {
        const now = Date.now()
        if (isProcessingRef.current) return;
        if (lastScannedRef.current.text === text && (now - lastScannedRef.current.time) < 3000) return;

        isProcessingRef.current = true
        lastScannedRef.current = { text, time: now }
        
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
          setTimeout(() => { 
            setTone('idle')
            setStatus(scanMode === 'camera' ? 'Aim camera at QR' : 'Upload QR Image')
            isProcessingRef.current = false
          }, 2500)
          
        } catch {
          setTone('error')
          setStatus('Connection error')
          setTimeout(() => { 
            setTone('idle'); 
            setStatus(scanMode === 'camera' ? 'Aim camera at QR' : 'Upload QR Image');
            isProcessingRef.current = false
          }, 2500)
        }
    }

    const startCamera = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
          processScan,
          () => {} // ignore frame errors
        )
      } catch (err) {
        console.error("Camera access failed", err)
        setTone('error')
        setStatus('Camera permission denied or not available.')
      }
    }

    const stopCamera = async () => {
        if (html5QrCode.isScanning) {
            try { await html5QrCode.stop() } catch(e) { console.error("Could not stop camera", e) }
        }
    }

    if (scanMode === 'camera') {
        startCamera()
    } else {
        stopCamera()
    }

    return () => {
        stopCamera().then(() => {
             // Only clear when leaving the component entirely
             if (selectedEvent === null && html5QrCodeRef.current) {
                 html5QrCodeRef.current.clear()
                 html5QrCodeRef.current = null
             }
        })
    }
  }, [selectedEvent, scanMode])

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (html5QrCodeRef.current) {
        try {
            setTone('neutral')
            setStatus('Scanning image...')
            const decodedText = await html5QrCodeRef.current.scanFile(file, true)
            // Once decoded, process it through the same flow as the camera
            // We simulate a small timeout because scanFile is instant
            setTimeout(() => {
                // To reuse processScan, we must temporarily trick isProcessingRef
                isProcessingRef.current = false;
                // create a fake ID so it doesn't get debounced immediately
                lastScannedRef.current = {text: null, time: 0} 
                
                // process it
                const html5QrCode = html5QrCodeRef.current;
                
                // Duplicated process scan logic for file upload (to avoid hoisting complexities)
                 const uploadProcess = async () => {
                    isProcessingRef.current = true
                    try {
                      setStatus('Checking ticket...')
                      const res = await fetch(`${apiBase}/api/tickets/scan`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: decodedText })
                      })
                      const data = await res.json().catch(() => ({}))
                      if (res.ok) { setTone('success'); setStatus('Valid entry') } 
                      else { setTone('error'); setStatus(data.message || 'Invalid ticket') }
                      setTimeout(() => { setTone('idle'); setStatus('Upload QR Image'); isProcessingRef.current = false; e.target.value = '' }, 2500)
                    } catch {
                      setTone('error'); setStatus('Connection error')
                      setTimeout(() => { setTone('idle'); setStatus('Upload QR Image'); isProcessingRef.current = false; e.target.value = '' }, 2500)
                    }
                 }
                 uploadProcess();
            }, 500)
        } catch (err) {
            setTone('error')
            setStatus("Couldn't find a QR code in image")
            setTimeout(() => { setTone('idle'); setStatus('Upload QR Image'); e.target.value = '' }, 3000)
        }
    }
  }

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedEvent(null); setStatus(''); setTone('idle'); setScanMode('camera') }}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                aria-label="Back to events"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h2 className="m-0 text-[18px] sm:text-[20px] font-bold text-gray-900 tracking-tight leading-tight">{selectedEvent.title}</h2>
                <p className="m-0 text-[12px] font-medium text-gray-500">Verifying tickets</p>
              </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button
                onClick={() => { setScanMode('camera'); setStatus('Aim camera at QR'); setTone('idle') }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${scanMode === 'camera' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Camera
             </button>
             <button
                onClick={() => { setScanMode('file'); setStatus('Upload QR Image'); setTone('idle') }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${scanMode === 'file' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Image
             </button>
          </div>
        </div>

        <div
          id={scannerId}
          className={`w-full rounded-[16px] overflow-hidden border border-gray-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] bg-gray-50 [&>div]:!border-0 ${scanMode === 'file' ? 'hidden' : 'block'}`}
        />

        {scanMode === 'file' && (
            <div className="w-full aspect-square max-h-[300px] rounded-[16px] border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 text-center hover:bg-gray-100 transition-colors relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[14px] font-bold text-gray-700 m-0 mb-1">Upload QR from Photos</p>
                <p className="text-[12px] font-medium text-gray-500 m-0">Tap here to select an image</p>
            </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 text-[14px] font-bold py-3.5 px-4 bg-gray-50 rounded-full border border-gray-100 uppercase tracking-wide text-gray-700">
          <div className={`w-3 h-3 rounded-full ${toneMap[tone] || toneMap.idle}`} />
          <span>{status || (scanMode === 'camera' ? 'Aim camera at QR' : 'Upload QR Image')}</span>
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
