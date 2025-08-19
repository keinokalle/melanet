import './App.css'
import { useState, useEffect } from 'react'
import LogbookView from './components/Logbook/LogbookView'
import Header from './components/Header'
import LoginView from './components/Login/loginView'
import membershipsService from './services/memberships'
import { Container, Row, Col, Button } from 'react-bootstrap'

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

  // Sets up the default club when memberships are set to userMemberships
  useEffect(() => {
    if (userMemberships.length > 0 && !currentClub) {
      console.log("about to set the default club");
      setCurrentClub(userMemberships[0].clubId);
    }
  }, [userMemberships, currentClub]);

  const fetchUserMemberships = async (userId) => {
    try {
      setLoading(true)
      const memberships = await membershipsService.getByUserId(userId)
      console.log(memberships);
      
      // Map the memberships to include both clubId and clubName
      const mappedMemberships = memberships.map(m => ({
        clubId: m.clubId,
        clubName: m.club.name
      }));
      console.log('Kuulun näihin', mappedMemberships);
      
      setUserMemberships(mappedMemberships);
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
      console.log("fetching");
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

  const handleNavigate = (section) => {
    setCurrentSection(section)
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginView onLoginSuccess={handleLoginSuccess} />
    }

    // Show login form when on login section (for re-login if needed)
    if (currentSection === 'login') {
      setCurrentSection('frontPage')
    }

    // Render club-specific sections
    switch (currentSection) {
      case 'frontPage':
        return <div>Welcome to Melanet! Select a section from the menu to get started.</div>
      case 'logbook':
        return <LogbookView clubId={currentClub} memberships={userMemberships} setClubChange={setCurrentClub}/>
      case 'reservationCalendar':
        return <div>Reservation Calendar for {userMemberships.find(m => m.clubId === currentClub)?.clubName || `Club ${currentClub}`}</div>
      case 'equipment':
        return <div>Equipment for {userMemberships.find(m => m.clubId === currentClub)?.clubName || `Club ${currentClub}`}</div>
      case 'statistics':
        return <div>Statistics for {userMemberships.find(m => m.clubId === currentClub)?.clubName || `Club ${currentClub}`}</div>
      default:
        return <div>Select a section from the menu</div>
    }
  }

  return (
    <div className="melanetContainer">
      <Header 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        userMemberships={userMemberships}
        onNavigate={handleNavigate}
        loading={loading}
      />
    
      <Container className="main-content mx-auto px-3 px-md-4 px-lg-5">
        <Row>
          <Col>
            <div className="content-section">
              {renderContent()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default App
