import Paddle from './Paddle'
import { useEffect, useState } from 'react'
import PaddleForm from './PaddleForm'
import paddlesService from '../../services/paddles'
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap'

/**
/**
 * Displays the full logbook page, including the list of paddling entries and the form to add new entries.
 * @component 
 * @param {Object} props - Component props
 * @param {string} props.clubId - The ID of the current club
 * @returns {JSX.Element} The rendered logbook view.
 */

function LogbookView({clubId, memberships, setClubChange}) {
  const [paddles, setPaddles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [modifyPaddle, setModifyPaddle] = useState(null)

  useEffect(() => {
    if (clubId) { // This check is already there, but let's make sure it's working
      paddlesService.getByClubId(clubId)
        .then(data => {
          console.log('this is what we get', data)
          setPaddles(data.paddles)
          console.log("fetched paddles successfully")
        })
        .catch(err => {
          console.error('Failed to fetch paddles:', err);
          setPaddles([]);
        })
    }
  }, [clubId])
    

  const handleSubmitPaddle = (paddleData) => {
    if (modifyPaddle) {
      // Update existing paddle
      paddlesService.update(modifyPaddle.id, paddleData)
        .then(updatedPaddle => {
          setPaddles(prev => prev.map(p => p.id === modifyPaddle.id ? updatedPaddle : p));
          setModifyPaddle(null);
        })
        .catch(err => {
          console.error('Failed to update paddle:', err);
          // Optionally, show an error message to the user here
        })
    } else {
      // Create new paddle
      paddlesService.create(paddleData)
        .then(createdPaddle => {
          setPaddles(prev => [createdPaddle, ...prev]);
        })
        .catch(err => {
          console.error('Failed to create paddle:', err);
          // Optionally, show an error message to the user here
        })
    }
  }

  const handleModifyPaddle = (paddle) => {
    console.log('handleModifyPaddle called with:', paddle);
    setModifyPaddle(paddle);
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

  const handleCancelForm = () => {
    setShowForm(false);
    setModifyPaddle(null);
  }

  return (
    <Container fluid>
      {/* Header Section with Club Selector */}
      <Row className="mb-4">
        <Col>
          {memberships && memberships.length > 1 ? (
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="mb-0 me-3">Logbook</h2>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="club-dropdown">
                  {memberships.find(m => m.clubId === clubId) ? 
                    memberships.find(m => m.clubId === clubId).clubName : 
                    'Select Club'
                  }
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {memberships.map((membership) => (
                    <Dropdown.Item 
                      key={membership.clubId}
                      onClick={() => setClubChange(membership.clubId)}
                      active={membership.clubId === clubId}
                    >
                      {membership.clubName}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          ) : (
            <h2>Logbook for {memberships[clubId].clubName}</h2>
          )}
        </Col>
      </Row>

      {/* Action Button */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant="primary" 
            onClick={() => setShowForm(s => !s)}
            size="lg"
          >
            {showForm ? 'Cancel' : 'New Paddle'}
          </Button>
        </Col>
      </Row>

      {/* Form Section */}
      {(showForm || modifyPaddle) && (
        <Row className="mb-4">
          <Col>
            <PaddleForm 
              onSubmit={handleSubmitPaddle} 
              onCancel={handleCancelForm} 
              clubId={clubId}
              paddle={modifyPaddle}
              isModify={!!modifyPaddle}
            />
          </Col>
        </Row>
      )}

      {/* Paddles List */}
      <Row>
        <Col>
          <div className="paddleList">
            {paddles
              .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
              .map((paddle, idx) => (
                <Paddle key={idx} paddle={paddle} onDelete={handleDeletePaddle} onModify={handleModifyPaddle}/> 
              ))}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default LogbookView; 