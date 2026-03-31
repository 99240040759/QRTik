import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { ExploreTab } from './tabs/ExploreTab'
import { TicketsTab } from './tabs/TicketsTab'
import { CreateEventTab } from './tabs/CreateEventTab'
import { ManageEventsTab } from './tabs/ManageEventsTab'
import { ScannerCard } from './ScannerCard'
import { BottomNav } from './layout/BottomNav'

export function Dashboard({ user, token }) {
  const { request, loading, error } = useApi(token)
  const [events, setEvents] = useState([])
  const [myTickets, setMyTickets] = useState([])
  const [activeTab, setActiveTab] = useState('explore')

  async function loadData() {
    const [eventsData, ticketsData] = await Promise.all([
      request('/api/events'),
      request('/api/tickets/my')
    ])
    setEvents(eventsData || [])
    setMyTickets(ticketsData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRegister(eventId) {
    const data = await request('/api/tickets/register', {
      method: 'POST',
      body: JSON.stringify({ eventId })
    })
    loadData()
    return data
  }

  async function handleCreateEvent(eventData) {
    await request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    })
    loadData()
    setActiveTab('manage')
  }

  async function handleDeleteEvent(eventId) {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    await request(`/api/events/${eventId}`, { method: 'DELETE' })
    loadData()
  }

  async function handleUpdateEvent(eventId, eventData) {
    await request(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    })
    loadData()
  }

  async function handleCompleteEvent(eventId) {
    if (!window.confirm('Mark this event as completed? Scanning will be disabled.')) return
    await request(`/api/events/${eventId}/complete`, { method: 'PATCH' })
    loadData()
  }

  const myCreatedEvents = events.filter(e => e.organizerId === user._id)

  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-[fadeIn_0.5s_ease-out_backwards] pb-24">
      {activeTab === 'explore' && (
        <ExploreTab events={events} onRegister={handleRegister} loading={loading} error={error} />
      )}
      {activeTab === 'tickets' && (
        <TicketsTab myTickets={myTickets} />
      )}
      {activeTab === 'create' && (
        <CreateEventTab onCreateEvent={handleCreateEvent} loading={loading} error={error} />
      )}
      {activeTab === 'manage' && (
        <ManageEventsTab
          myCreatedEvents={myCreatedEvents}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateEvent}
          onComplete={handleCompleteEvent}
          loading={loading}
        />
      )}
      {activeTab === 'scan' && (
        <ScannerCard myCreatedEvents={myCreatedEvents} />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
