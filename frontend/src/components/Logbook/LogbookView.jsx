import Paddle from './Paddle'
import { useState } from 'react'
import Form from './Form'

/**
/**
 * Displays the full logbook page, including the list of paddling entries and the form to add new entries.
 * @component 
 * @param {Object} props - No props are required for this component.
 * @returns {JSX.Element} The rendered logbook view.
 */

function LogbookView() {
  const [paddles, setPaddles] = useState([
    {
      date: '2024-06-01',
      name: 'Kalle Keinonen',
      kayak: 'K1',
      route: 'Lake Helsinki',
      starttime: '08:00',
      endtime: '10:00',
      status: 'Completed',
    },
    {
      date: '2024-06-02',
      name: 'Oona Keinonen',
      kayak: 'K2',
      route: 'River Vantaa',
      starttime: '09:30',
      endtime: '12:00',
      status: 'Completed',
    },
    {
      date: '2024-06-02',
      name: 'Ella Keinonen',
      kayak: 'C1',
      route: 'Archipelago Trail',
      starttime: '07:15',
      endtime: '',
      status: 'In progress',
    },
  ])
  const [showForm, setShowForm] = useState(false)

  const handleAddPaddle = (newPaddle) => {
    setPaddles(prev => [newPaddle, ...prev])
  }

  return (
    <div>
      <button onClick={() => setShowForm(s => !s)}>
        {showForm ? 'Cancel' : 'Create New Paddle'}
      </button>
      {showForm && (
        <Form onAdd={handleAddPaddle} onCancel={() => setShowForm(false)} />
      )}
      <div className="paddleList">
        {paddles
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((paddle, idx) => (
            <Paddle key={idx} {...paddle} />
          ))}
      </div>
    </div>
  )
}

export default LogbookView; 