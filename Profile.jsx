import { useState, useEffect } from 'react'
import { 
  User, 
  Wallet, 
  TrendingUp, 
  History, 
  Settings,
  Plus,
  Minus,
  Trophy,
  Target,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, updateBalance } = useAuth()
  const [bets, setBets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const [betsRes, transactionsRes, statsRes] = await Promise.all([
        fetch('/api/my-bets', { credentials: 'include' }),
        fetch('/api/transaction-history', { credentials: 'include' }),
        fetch('/api/betting-stats', { credentials: 'include' })
      ])

      if (betsRes.ok) {
        const betsData = await betsRes.json()
        setBets(betsData)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.transactions || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(depositAmount) })
      })

      if (response.ok) {
        await updateBalance()
        setDepositAmount('')
        fetchUserData()
        alert('Deposit successful!')
      }
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      })

      if (response.ok) {
        await updateBalance()
        setWithdrawAmount('')
        fetchUserData()
        alert('Withdrawal successful!')
      }
    } catch (error) {
      console.error('Withdrawal failed:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBetStatusColor = (status) => {
    switch (status) {
      case 'won': return 'bg-green-500'
      case 'lost': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
        <Button onClick={() => window.location.href = '/login'}>
          Log In
        </Button>
      </div>
    )
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
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-blue-100">{user.email}</p>
            <p className="text-sm text-blue-200">
              Member since {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-2xl font-bold text-white">${user.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bets</p>
                <p className="text-2xl font-bold text-white">{stats.total_bets || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">{stats.win_rate || 0}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Winnings</p>
                <p className="text-2xl font-bold text-white">${stats.total_winnings?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="wallet" className="data-[state=active]:bg-blue-600">
            <Wallet className="mr-2 h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="bets" className="data-[state=active]:bg-blue-600">
            <TrendingUp className="mr-2 h-4 w-4" />
            My Bets
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="mr-2 h-5 w-5 text-green-400" />
                  Deposit Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deposit" className="text-white">Amount</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button 
                  onClick={handleDeposit}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Deposit
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Minus className="mr-2 h-5 w-5 text-red-400" />
                  Withdraw Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw" className="text-white">Amount</Label>
                  <Input
                    id="withdraw"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button 
                  onClick={handleWithdraw}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Withdraw
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bets Tab */}
        <TabsContent value="bets" className="space-y-4">
          {bets.length > 0 ? (
            bets.map((bet) => (
              <Card key={bet.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getBetStatusColor(bet.status)}>
                          {bet.status.toUpperCase()}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          {formatDate(bet.placed_at)}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        {bet.event?.home_team} vs {bet.event?.away_team}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {bet.betting_option?.option_value} @ {bet.odds}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${bet.amount}</p>
                      <p className="text-gray-400 text-sm">
                        Potential: ${bet.potential_payout}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Bets Yet</h3>
              <p className="text-gray-400">Start betting to see your bet history here.</p>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium capitalize">
                        {transaction.transaction_type}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.description && (
                        <p className="text-gray-400 text-sm">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                    <div className={`text-lg font-semibold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Transaction History</h3>
              <p className="text-gray-400">Your transaction history will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile

