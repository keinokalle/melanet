import Paddle from './Paddle'
import { useEffect, useState } from 'react'
import Form from './Form'
import paddlesService from '../../services/paddles'

/**
/**
 * Displays the full logbook page, including the list of paddling entries and the form to add new entries.
 * @component 
 * @param {Object} props - Component props
 * @param {string} props.clubId - The ID of the current club
 * @returns {JSX.Element} The rendered logbook view.
 */

function LogbookView({ clubId }) {
  const [paddles, setPaddles] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (clubId) {
      paddlesService.getByClubId(clubId)
        .then(data => setPaddles(data))
        .catch(err => {
          console.error('Failed to fetch paddles:', err);
          setPaddles([]);
        });
    }
  }, [clubId])
    

  const handleAddPaddle = (newPaddle) => {
    paddlesService.create(newPaddle)
      .then(createdPaddle => {
        setPaddles(prev => [createdPaddle, ...prev]);
      })
      .catch(err => {
        console.error('Failed to create paddle:', err);
        // Optionally, show an error message to the user here
      })
  }

  const handleDeletePaddle = (paddleId) => {
    console.log("YOU WANT TO DELETE???");
    
    paddlesService.remove(paddleId)
      .then(() => {
        const newPaddles = paddles.filter(p => p.id !== paddleId)
        setPaddles(newPaddles);
      })
      .catch(err => {
        console.error('Failed to delete paddle:', err);
        // Optionally, show an error message to the user here
      })
  }

  return (
    <div>
      {clubId && <h2>Logbook for Club {clubId}</h2>}
      <button onClick={() => setShowForm(s => !s)}>
        {showForm ? 'Cancel' : 'New Paddle'}
      </button>
      {showForm && (
        <Form onAdd={handleAddPaddle} onCancel={() => setShowForm(false)} clubId={clubId} />
      )}
      <div className="paddleList">
        {paddles
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          .map((paddle, idx) => (
            <Paddle key={idx} {...paddle} onDelete={handleDeletePaddle}/> 
          ))}
      </div>
    </div>
  )
}

export default LogbookView; 