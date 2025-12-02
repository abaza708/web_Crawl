import { useState } from 'react'
import { Clock, Play, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import BetModal from './BetModal'

const EventCard = ({ event, isLive = false }) => {
  const [showBetModal, setShowBetModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const { user } = useAuth()

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleBetClick = (option) => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }
    setSelectedOption(option)
    setShowBetModal(true)
  }

  const getStatusBadge = () => {
    if (isLive || event.status === 'live') {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <Play className="w-3 h-3 mr-1" />
          LIVE
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        {formatTime(event.start_time)}
      </Badge>
    )
  }

  // Mock betting options if not provided
  const bettingOptions = event.betting_options || [
    { id: 1, option_type: 'win', option_value: 'home', odds: 2.1 },
    { id: 2, option_type: 'win', option_value: 'draw', odds: 3.5 },
    { id: 3, option_type: 'win', option_value: 'away', odds: 3.2 },
  ]

  const getOptionLabel = (option) => {
    switch (option.option_value) {
      case 'home':
        return '1'
      case 'draw':
        return 'X'
      case 'away':
        return '2'
      default:
        return option.option_value
    }
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 hover:border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{event.sport?.icon || '⚽'}</span>
              <span className="text-sm text-gray-400">{event.sport_name || 'Football'}</span>
            </div>
            {getStatusBadge()}
          </div>
          
          {!isLive && (
            <div className="text-xs text-gray-400">
              {formatDate(event.start_time)}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {event.home_team.charAt(0)}
                  </span>
                </div>
                <span className="text-white font-medium">{event.home_team}</span>
              </div>
              {isLive && (
                <span className="text-xl font-bold text-white">{event.home_score || 0}</span>
              )}
            </div>

            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-sm">vs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {event.away_team.charAt(0)}
                  </span>
                </div>
                <span className="text-white font-medium">{event.away_team}</span>
              </div>
              {isLive && (
                <span className="text-xl font-bold text-white">{event.away_score || 0}</span>
              )}
            </div>
          </div>

          {/* Betting Options */}
          <div className="grid grid-cols-3 gap-2">
            {bettingOptions.slice(0, 3).map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="sm"
                className="flex flex-col p-2 h-auto border-slate-600 hover:border-blue-500 hover:bg-blue-500/10"
                onClick={() => handleBetClick(option)}
              >
                <span className="text-xs text-gray-400 mb-1">
                  {getOptionLabel(option)}
                </span>
                <span className="text-sm font-semibold text-white">
                  {option.odds.toFixed(2)}
                </span>
              </Button>
            ))}
          </div>

          {/* Additional Info */}
          {bettingOptions.length > 3 && (
            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                +{bettingOptions.length - 3} more markets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bet Modal */}
      {showBetModal && selectedOption && (
        <BetModal
          isOpen={showBetModal}
          onClose={() => setShowBetModal(false)}
          event={event}
          bettingOption={selectedOption}
        />
      )}
    </>
  )
}

export default EventCard

