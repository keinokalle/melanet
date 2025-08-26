import { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Dropdown, Toast, ToastContainer, Form } from 'react-bootstrap'
import { handleApiError, createToast } from '../../util/errorHandler'
import reservationsService from '../../services/reservations'
import equipmentsService from '../../services/equipments'
import Reservation from './Reservation'
import ReservationForm from './ReservationForm'

/**
 * Displays the full reservations page, including the list of reservations and the form to add new reservations.
 * @component 
 * @param {Object} props - Component props
 * @param {string} props.clubId - The ID of the current club
 * @param {Array} props.memberships - Array of user memberships
 * @param {Function} props.setClubChange - Function to change the selected club
 * @returns {JSX.Element} The rendered reservations view.
 */

function ReservationView({clubId, memberships, setClubChange}) {
  const [reservations, setReservations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Future') // Track which filter is selected
  const [equipment, setEquipment] = useState([])
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('')

  // Helper function to add toasts
  const addToast = (toast) => {
    setToasts(prev => [...prev, toast])
    // Auto-remove toast after 9 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 9000)
  }

  // Handle filter button clicks
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType)
  }

  // Handle equipment filter change
  const handleEquipmentFilterChange = (e) => {
    setSelectedEquipmentFilter(e.target.value)
  }

  // Fetch equipment for the filter dropdown
  const fetchEquipment = async () => {
    if (!clubId) return
    try {
      const data = await equipmentsService.getByClubId(clubId)
      setEquipment(data.equipment || data)
    } catch (error) {
      console.error('Failed to fetch equipment:', error)
      setEquipment([])
    }
  }

  // Handle main button click (New Reservation)
  const handleMainButtonClick = () => {
    setShowForm(true)
  }

  // Handle form submission
  const handleSubmitReservation = async (reservationData) => {
    try {
      setIsLoading(true)
      const createdReservation = await reservationsService.create(reservationData)
      setReservations(prev => [createdReservation, ...prev])
      addToast(createToast('Reservation created successfully!', 'Success', 'success'))
      setShowForm(false)
    } catch (error) {
      const { errorMessage, errorTitle } = handleApiError(error, 'reservation creation')
      addToast(createToast(errorMessage, errorTitle))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form cancellation
  const handleCancelForm = () => {
    setShowForm(false)
  }

  // Handle reservation modification
  const handleModifyReservation = (reservation) => {
    console.log('Modifying reservation:', reservation)
    // TODO: Implement reservation modification
    addToast(createToast('Reservation modification will be implemented here', 'Info', 'info'))
  }

  // Handle reservation deletion
  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        setIsLoading(true)
        await reservationsService.remove(reservationId)
        
        // Remove the deleted reservation from the local state
        setReservations(prev => prev.filter(r => r.id !== reservationId))
        
        addToast(createToast('Reservation deleted successfully!', 'Success', 'success'))
      } catch (error) {
        const { errorMessage, errorTitle } = handleApiError(error, 'reservation deletion')
        addToast(createToast(errorMessage, errorTitle))
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (clubId) {
      // Fetch equipment for the filter dropdown
      fetchEquipment()
      
      // Function to fetch reservations based on active filter
      const fetchReservations = () => {
        setIsLoading(true)
        
        // Build query parameters based on active filter
        let queryParams = {}
        
        if (activeFilter === 'My') {
          queryParams.userId = localStorage.getItem('userId')
        } else if (activeFilter === 'Future') {
          // Show reservations that have end time in the future (including current ones)
          // This will be handled by the backend to filter reservations with endTime > now
          queryParams.showActive = 'true'
        }
        
        // Add equipment filter if selected
        if (selectedEquipmentFilter) {
          queryParams.equipmentId = selectedEquipmentFilter
        }
        
        reservationsService.getByClubId(clubId, queryParams)
          .then(data => {
            setReservations(data.reservations)
            console.log("Reservations with filter:", activeFilter, "equipment:", selectedEquipmentFilter, data.reservations)
          })
          .catch(err => {
            const { errorMessage, errorTitle } = handleApiError(err, 'reservations')
            addToast(createToast(errorMessage, errorTitle))
            setReservations([])
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
      
      fetchReservations()
    }
  }, [clubId, activeFilter, selectedEquipmentFilter])

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
              <h2 className="mb-0 me-3">Reservations</h2>
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
            <h2>Reservations for {memberships.find(m => m.clubId === clubId)?.clubName || 'Unknown Club'}</h2>
          )}
        </Col>
      </Row>

      {/* Action Buttons and Filters */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            {/* Filter Button Group */}
            <div className="btn-group" role="group" aria-label="Reservation filters">
              <Button 
                variant={activeFilter === 'My' ? 'primary' : 'outline-secondary'}
                onClick={() => handleFilterClick('My')}
              >
                My
              </Button>
              <Button 
                variant={activeFilter === 'Future' ? 'primary' : 'outline-secondary'}
                onClick={() => handleFilterClick('Future')}
              >
                Future
              </Button>
            </div>
            
            {/* New Reservation Button */}
            <div className="text-end">
              <Button 
                variant="primary"
                onClick={handleMainButtonClick}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'New Reservation'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Equipment Filter Row */}
      <Row className="mb-3">
        <Col>
          <Form.Select
            value={selectedEquipmentFilter}
            onChange={handleEquipmentFilterChange}
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="">All Equipment</option>
            {equipment.map(item => (
              <option key={item.id} value={item.id}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}: {item.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* ReservationForm Modal */}
      <ReservationForm 
        show={showForm}
        onSubmit={handleSubmitReservation} 
        onCancel={handleCancelForm} 
        clubId={clubId}
      />

      {/* Reservations List */}
      <Row>
        <Col className="px-0 px-sm-3 px-md-4">
          <div className="reservationsList">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No reservations found.</p>
                <p className="text-muted">Create your first reservation using the "New Reservation" button above.</p>
              </div>
            ) : (
              <div>
                {reservations.map(reservation => {
                  // Add canEdit property for now (you can implement proper permission logic later)
                  const reservationWithPermissions = {
                    ...reservation,
                    canEdit: true // TODO: Implement proper permission checking
                  }
                  
                  return (
                    <Reservation
                      key={reservation.id}
                      reservation={reservationWithPermissions}
                      onModify={handleModifyReservation}
                      onDelete={handleDeleteReservation}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ReservationView
