import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Sports from './components/Sports'
import Live from './components/Live'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} />
            
            <main className="flex-1 lg:ml-64 transition-all duration-300">
              <div className="p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sports" element={<Sports />} />
                  <Route path="/live" element={<Live />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
