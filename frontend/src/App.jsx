import './App.css'
import { useState, useEffect } from 'react'
import LogbookView from './components/Logbook/LogbookView'
import Menu from './components/Menu'
import LoginView from './components/Login/loginView'
import membershipsService from './services/memberships'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userMemberships, setUserMemberships] = useState([])
  const [currentClub, setCurrentClub] = useState(null)
  const [currentSection, setCurrentSection] = useState('login')
  const [loading, setLoading] = useState(false)

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (token && userId) {
      setIsLoggedIn(true)
      fetchUserMemberships(userId)
    }
  }, [])

  const fetchUserMemberships = async (userId) => {
    try {
      setLoading(true)
      const memberships = await membershipsService.getByUserId(userId)
      console.log(memberships)
      setUserMemberships(memberships)
    } catch (error) {
      console.error('Error fetching memberships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true)
    setCurrentSection('login') // Stay on login view to show user info
    if (userData.id) {
      fetchUserMemberships(userData.id)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('name')
    localStorage.removeItem('userId')
    
    setIsLoggedIn(false)
    setUserMemberships([])
    setCurrentClub(null)
    setCurrentSection('login')
  }

  const handleNavigate = (clubId, section) => {
    setCurrentClub(clubId)
    setCurrentSection(section)
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginView onLoginSuccess={handleLoginSuccess} />
    }

    // Show login form when on login section (for re-login if needed)
    if (currentSection === 'login') {
      return (
        <div>
          <h2>User Dashboard</h2>
          <p>Select a club and section from the menu to get started.</p>
        </div>
      )
    }

    // Render club-specific sections
    switch (currentSection) {
      case 'logbook':
        return <LogbookView clubId={currentClub} />
      case 'reservationCalendar':
        return <div>Reservation Calendar for Club {currentClub}</div>
      case 'equipment':
        return <div>Equipment for Club {currentClub}</div>
      case 'statistics':
        return <div>Statistics for Club {currentClub}</div>
      default:
        return <div>Select a section from the menu</div>
    }
  }

  return (
    <div className="melanetContainer">
      <div className="header">
        <h1>Melanet</h1>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <span className="user-info">
                Welcome, {localStorage.getItem('name') || localStorage.getItem('username')}!
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <span>Please log in</span>
          )}
        </div>
      </div>
      <div className="main-content">
        <div className="menu-section">
          <Menu 
            isLoggedIn={isLoggedIn}
            userMemberships={userMemberships}
            onNavigate={handleNavigate}
            loading={loading}
          />
        </div>
        <div className="content-section">
          {renderContent()}
        </div>
      </div>
      <img src="/image.png" alt="Melanet logo" className="melanet-image" />
    </div>
  )
}

export default App
