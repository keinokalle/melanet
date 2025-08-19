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
    // Auto-remove toast after 9 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 9000)
  }

  // Derived state for paddling status
  const getPaddlingStatus = () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return { isPaddling: false, activePaddle: null, hasMultipleActive: false }

    const activePaddles = paddles.filter(paddle => 
      paddle.userId === parseInt(userId) && 
      paddle.startTime && 
      !paddle.endTime
    )

    if (activePaddles.length === 0) {
      return { isPaddling: false, activePaddle: null, hasMultipleActive: false }
    } else if (activePaddles.length === 1) {
      return { isPaddling: true, activePaddle: activePaddles[0], hasMultipleActive: false }
    } else {
      // Multiple active paddles - this shouldn't happen but we handle it gracefully
      console.warn(`User ${userId} has ${activePaddles.length} active paddles. This may indicate a data inconsistency.`)
      // Return the most recent active paddle
      const mostRecent = activePaddles.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0]
      return { isPaddling: true, activePaddle: mostRecent, hasMultipleActive: true }
    }
  }

  const { isPaddling, activePaddle, hasMultipleActive } = getPaddlingStatus()

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
      console.log('This is the paddle that is to be updated', paddleData)

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
    } else if (isPaddling && activePaddle) {
      // End existing paddle
      paddlesService.update(activePaddle.id, paddleData)
        .then(updatedPaddle => {
          setPaddles(prev => prev.map(p => p.id === activePaddle.id ? updatedPaddle : p))
          addToast(createToast('Paddle ended successfully!', 'Success', 'success'))
        })
        .catch(err => {
          const { errorMessage, errorTitle } = handleApiError(err, 'ending paddle')
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

  const handleMainButtonClick = () => {
    if (isPaddling && activePaddle) {
      // End paddle - show form with active paddle data
      setModifyPaddle(activePaddle)
    } else {
      // New paddle - show empty form
      setShowForm(true)
    }
  }

  /*
  // Show warning toast if multiple active paddles detected
  useEffect(() => {
    if (hasMultipleActive) {
      addToast(createToast(
        'Multiple active paddles detected. Please contact support if this persists.',
        'Warning',
        'warning'
      ))
    }
  }, [hasMultipleActive])
  */
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
            <h2>Logbook for {memberships.find(m => m.clubId === clubId)?.clubName || 'Unknown Club'}</h2>
          )}
        </Col>
      </Row>

      {/* Action Button */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant={isPaddling ? "warning" : "primary"}
            onClick={handleMainButtonClick}
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (
              isPaddling ? 'End Paddle' : 'New Paddle'
            )}
          </Button>
          {hasMultipleActive && (
            <small className="text-warning d-block mt-1">
              ⚠️ Multiple active paddles detected
            </small>
          )}
        </Col>
      </Row>

      {/* PaddleForm Modal */}
      <PaddleForm 
        show={showForm || !!modifyPaddle}
        onSubmit={handleSubmitPaddle} 
        onCancel={handleCancelForm} 
        clubId={clubId}
        paddle={modifyPaddle}
        isModify={!!modifyPaddle}
      />

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