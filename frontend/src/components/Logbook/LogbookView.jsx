import Paddle from './Paddle'
import { useEffect, useState } from 'react'
import PaddleForm from './PaddleForm'
import paddlesService from '../../services/paddles'
import { Container, Row, Col, Button, Dropdown, Toast, ToastContainer } from 'react-bootstrap'
import { handleApiError, createToast } from '../../util/errorHandler'

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
  const [toasts, setToasts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to add toasts
  const addToast = (toast) => {
    setToasts(prev => [...prev, toast])
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 9000)
  }

  useEffect(() => {
    if (clubId) {
      setIsLoading(true)
      paddlesService.getByClubId(clubId)
        .then(data => {
          setPaddles(data.paddles)
        })
        .catch(err => {
          const { errorMessage, errorTitle } = handleApiError(err, 'paddles')
          addToast(createToast(errorMessage, errorTitle))
          setPaddles([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [clubId])
    

  const handleSubmitPaddle = (paddleData) => {
    setIsLoading(true)
    if (modifyPaddle) {
      // Update existing paddle
      paddlesService.update(modifyPaddle.id, paddleData)
        .then(updatedPaddle => {
          setPaddles(prev => prev.map(p => p.id === modifyPaddle.id ? updatedPaddle : p))
          setModifyPaddle(null)
          addToast(createToast('Paddle updated successfully!', 'Success', 'success'))
        })
        .catch(err => {
          const { errorMessage, errorTitle } = handleApiError(err, 'paddle update')
          addToast(createToast(errorMessage, errorTitle))
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // Create new paddle
      paddlesService.create(paddleData)
        .then(createdPaddle => {
          setPaddles(prev => [createdPaddle, ...prev])
          addToast(createToast('Paddle created successfully!', 'Success', 'success'))
        })
        .catch(err => {
          const { errorMessage, errorTitle } = handleApiError(err, 'paddle creation')
          addToast(createToast(errorMessage, errorTitle))
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const handleModifyPaddle = (paddle) => {
    setModifyPaddle(paddle)
  }

  const handleDeletePaddle = (paddleId) => {
    if (window.confirm('Are you sure you want to delete this paddle?')) {
      setIsLoading(true)
      paddlesService.remove(paddleId)
        .then(() => {
          const newPaddles = paddles.filter(p => p.id !== paddleId)
          setPaddles(newPaddles)
          addToast(createToast('Paddle deleted successfully!', 'Success', 'success'))
        })
        .catch(err => {
          const { errorMessage, errorTitle } = handleApiError(err, 'paddle deletion')
          addToast(createToast(errorMessage, errorTitle))
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setModifyPaddle(null)
  }

  return (
    <Container fluid>
      {/* Toast Container for notifications */}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(toast => (
          <Toast key={toast.id} bg={toast.variant} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
            <Toast.Header closeButton>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === 'success' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

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
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (showForm ? 'Cancel' : 'New Paddle')}
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
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : paddles.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>No paddles found for this club.</p>
              </div>
            ) : (
              paddles
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .map((paddle, idx) => (
                  <Paddle key={idx} paddle={paddle} onDelete={handleDeletePaddle} onModify={handleModifyPaddle}/> 
                ))
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default LogbookView; 