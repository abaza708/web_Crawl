import { useState } from 'react'
import { X, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'

const BetModal = ({ isOpen, onClose, event, bettingOption }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, updateBalance } = useAuth()

  const potentialPayout = amount ? (parseFloat(amount) * bettingOption.odds).toFixed(2) : '0.00'
  const potentialProfit = amount ? (parseFloat(amount) * (bettingOption.odds - 1)).toFixed(2) : '0.00'

  const quickAmounts = [10, 25, 50, 100]

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString())
    setError('')
  }

  const handlePlaceBet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid bet amount')
      return
    }

    if (parseFloat(amount) > user.balance) {
      setError('Insufficient balance')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          betting_option_id: bettingOption.id,
          amount: parseFloat(amount)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await updateBalance()
        onClose()
        // Show success message
        alert('Bet placed successfully!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to place bet')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getOptionLabel = () => {
    switch (bettingOption.option_value) {
      case 'home':
        return `${event.home_team} to win`
      case 'away':
        return `${event.away_team} to win`
      case 'draw':
        return 'Draw'
      default:
        return bettingOption.option_value
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Place Bet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">
              {event.sport_name || 'Football'}
            </div>
            <div className="text-white font-medium mb-2">
              {event.home_team} vs {event.away_team}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">{getOptionLabel()}</span>
              <span className="text-lg font-bold text-green-400">
                {bettingOption.odds.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-white">
              Bet Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                min="0"
                step="0.01"
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Payout Info */}
          {amount && (
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stake:</span>
                <span className="text-white">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Profit:</span>
                <span className="text-green-400">${potentialProfit}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-slate-600 pt-2">
                <span className="text-white">Total Payout:</span>
                <span className="text-green-400">${potentialPayout}</span>
              </div>
            </div>
          )}

          {/* Balance Info */}
          <div className="text-sm text-gray-400">
            Available Balance: <span className="text-white">${user.balance.toFixed(2)}</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Placing...
                </div>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Place Bet
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BetModal

