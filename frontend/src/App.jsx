import './App.css'
import { useState, useEffect } from 'react'
import LogbookView from './components/Logbook/LogbookView'
import Menu from './components/Menu'

function App() {
  const [section, setSection] = useState('logbook')

  useEffect(() => {
    console.log(section)
  }, [section])

  return (
    <div className="melanetContainer">
      <h1>Melanet</h1>
      <Menu onNavigate={setSection} />
      {section === 'logbook' && <LogbookView />}
      {section === 'reservationCalendar' && <div>Reservation Calendar</div>}
      {section === 'equipment' && <div>Equipment</div>}
      {section === 'statistics' && <div>Statistics</div>}
      <img src="/image.png" alt="Melanet logo" className="melanet-image" />
    </div>
  )
}

export default App
