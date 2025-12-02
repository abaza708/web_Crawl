import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Trophy, 
  Radio, 
  TrendingUp, 
  Star,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const Sidebar = ({ isOpen }) => {
  const [sports, setSports] = useState([])
  const location = useLocation()

  useEffect(() => {
    fetchSports()
  }, [])

  const fetchSports = async () => {
    try {
      const response = await fetch('/api/sports')
      if (response.ok) {
        const data = await response.json()
        setSports(data)
      }
    } catch (error) {
      console.error('Failed to fetch sports:', error)
    }
  }

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/sports', icon: Trophy, label: 'Sports' },
    { path: '/live', icon: Radio, label: 'Live Betting' },
    { path: '/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/favorites', icon: Star, label: 'Favorites' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-slate-800/95 backdrop-blur-sm border-r border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${isActive(item.path) 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Sports Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Sports
              </h3>
              <div className="space-y-1">
                {sports.map((sport) => (
                  <Link
                    key={sport.id}
                    to={`/sports/${sport.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{sport.icon}</span>
                      {sport.name}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Promotional Banner */}
          <div className="p-4 border-t border-slate-700">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center">
              <h4 className="text-white font-semibold text-sm mb-1">
                Welcome Bonus
              </h4>
              <p className="text-blue-100 text-xs mb-3">
                Get $1000 free on your first deposit!
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Claim Now
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

