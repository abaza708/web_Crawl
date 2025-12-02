import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Trophy,
  ArrowRight,
  Play,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from './EventCard'

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [liveEvents, setLiveEvents] = useState([])
  const [popularEvents, setPopularEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [featuredRes, liveRes, popularRes] = await Promise.all([
        fetch('/api/events?status=upcoming&limit=6'),
        fetch('/api/events/live'),
        fetch('/api/events/popular')
      ])

      if (featuredRes.ok) {
        const featured = await featuredRes.json()
        setFeaturedEvents(featured)
      }

      if (liveRes.ok) {
        const live = await liveRes.json()
        setLiveEvents(live)
      }

      if (popularRes.ok) {
        const popular = await popularRes.json()
        setPopularEvents(popular)
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Welcome to <span className="text-yellow-400">Abazabet</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-6 text-blue-100">
            The ultimate sports betting experience with live odds and instant payouts
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              Start Betting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Play className="mr-2 h-5 w-5" />
              Watch Live
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent"></div>
        </div>
      </div>

      {/* Stats Cards */}
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
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">12,847</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Payouts</p>
                <p className="text-2xl font-bold text-white">$2.4M</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      {liveEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Play className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Live Now</h2>
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            </div>
            <Link to="/live">
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} isLive={true} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Star className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Featured Events</h2>
          </div>
          <Link to="/sports">
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Popular Events */}
      {popularEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Trending</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {popularEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Home

