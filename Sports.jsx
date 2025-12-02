import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from './EventCard'

const Sports = () => {
  const [sports, setSports] = useState([])
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedSport, setSelectedSport] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSportsAndEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, selectedSport, searchTerm])

  const fetchSportsAndEvents = async () => {
    try {
      const [sportsRes, eventsRes] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/events?status=upcoming&limit=50')
      ])

      if (sportsRes.ok) {
        const sportsData = await sportsRes.json()
        setSports(sportsData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (selectedSport) {
      filtered = filtered.filter(event => event.sport_id === selectedSport.id)
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }

  const getEventCountBySport = (sportId) => {
    return events.filter(event => event.sport_id === sportId).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sports Betting</h1>
          <p className="text-gray-400">
            Choose from {events.length} upcoming events across {sports.length} sports
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teams or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sports Filter Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Sports Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* All Sports Option */}
              <Button
                variant={selectedSport === null ? "default" : "ghost"}
                className={`w-full justify-between ${
                  selectedSport === null 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
                onClick={() => setSelectedSport(null)}
              >
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  All Sports
                </div>
                <Badge variant="secondary">{events.length}</Badge>
              </Button>

              {/* Individual Sports */}
              {sports.map((sport) => {
                const eventCount = getEventCountBySport(sport.id)
                return (
                  <Button
                    key={sport.id}
                    variant={selectedSport?.id === sport.id ? "default" : "ghost"}
                    className={`w-full justify-between ${
                      selectedSport?.id === sport.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedSport(sport)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">{sport.icon}</span>
                      {sport.name}
                    </div>
                    <Badge variant="secondary">{eventCount}</Badge>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          {/* Filter Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedSport ? selectedSport.name : 'All Sports'}
              </h2>
              <Badge variant="outline" className="border-slate-600 text-gray-300">
                {filteredEvents.length} events
              </Badge>
            </div>
            
            {(selectedSport || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSport(null)
                  setSearchTerm('')
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Events */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? `No events match "${searchTerm}"`
                  : selectedSport 
                    ? `No upcoming events for ${selectedSport.name}`
                    : 'No events available at the moment'
                }
              </p>
              {(selectedSport || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSport(null)
                    setSearchTerm('')
                  }}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  View All Events
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sports

