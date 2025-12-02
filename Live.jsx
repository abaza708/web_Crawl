import { useState, useEffect } from 'react'
import { Play, Radio, Clock, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from './EventCard'

const Live = () => {
  const [liveEvents, setLiveEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveEvents()
    
    // Set up polling for live updates
    const interval = setInterval(fetchLiveEvents, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchLiveEvents = async () => {
    try {
      const response = await fetch('/api/events/live')
      if (response.ok) {
        const data = await response.json()
        setLiveEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch live events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Play className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Live Betting</h1>
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>
          <p className="text-gray-400">
            {liveEvents.length} live events with real-time odds
          </p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Radio className="h-4 w-4 animate-pulse text-red-400" />
          <span>Auto-updating every 10s</span>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Events</p>
                <p className="text-2xl font-bold text-white">{liveEvents.length}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Play className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Bettors</p>
                <p className="text-2xl font-bold text-white">3,247</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Volume</p>
                <p className="text-2xl font-bold text-white">$847K</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      {liveEvents.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-white">Live Events</h2>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} isLive={true} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Live Events</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            There are currently no live events available for betting. 
            Check back soon or explore our upcoming events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
              onClick={() => window.location.href = '/sports'}
            >
              <Clock className="mr-2 h-4 w-4" />
              View Upcoming Events
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={fetchLiveEvents}
            >
              <Radio className="mr-2 h-4 w-4" />
              Refresh Live Events
            </Button>
          </div>
        </div>
      )}

      {/* Live Betting Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Play className="mr-2 h-5 w-5 text-red-400" />
              Real-Time Odds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              Get the latest odds that update in real-time as the game progresses.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
              Live Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              Access detailed live statistics and match data to make informed bets.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Radio className="mr-2 h-5 w-5 text-green-400" />
              Instant Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              Win and get paid instantly when your live bets are successful.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Live

