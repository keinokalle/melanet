import { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap'
import equipmentsService from '../../services/equipments'
import reservationsService from '../../services/reservations'

/**
 * Shared form component for creating and modifying paddle events.
 * Now includes reservation checking flow.
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with paddle data when form is submitted.
 * @param {Function} [props.onCancel] - Called when the form is cancelled.
 * @param {string} props.clubId - The ID of the current club
 * @param {Object} [props.paddle] - Paddle data for modification mode
 * @param {boolean} [props.isModify] - Whether this is modification mode
 * @param {boolean} props.show - Whether the modal should be shown
 * @returns {JSX.Element} – A Bootstrap modal for adding or modifying paddle data
 */

function PaddleForm({ onSubmit, onCancel, clubId, paddle = null, isModify = false, show = false }) {
  // Calculate default start time (current time) in Finland timezone
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes());
    
    // Convert to Finland timezone (Europe/Helsinki)
    const finlandTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Helsinki"}));
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = finlandTime.getFullYear();
    const month = String(finlandTime.getMonth() + 1).padStart(2, '0');
    const day = String(finlandTime.getDate()).padStart(2, '0');
    const hours = String(finlandTime.getHours()).padStart(2, '0');
    const minutes = String(finlandTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [equipment, setEquipment] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [userReservations, setUserReservations] = useState([])
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showReservationFlow, setShowReservationFlow] = useState(false)
  const [showQuickReservation, setShowQuickReservation] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [quickReservationData, setQuickReservationData] = useState({
    startTime: getDefaultStartTime(),
    endTime: ''
  })
  const [availableEquipment, setAvailableEquipment] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [loadingAvailableEquipment, setLoadingAvailableEquipment] = useState(false)

  // Format datetime for input field (YYYY-MM-DDTHH:MM)
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    startTime: getDefaultStartTime(),
    endTime: '',
    length: null,
    info: '',
    additionalInfo: null,
    userId: localStorage.getItem('userId') || '',
    clubId: clubId || '',
    equipmentId: ''
  });

  const fetchEquipment = useCallback(async () => {
    try {
      setLoadingEquipment(true);
      const data = await equipmentsService.getByClubId(clubId);
      setEquipment(data.equipment || data); // Handle different response formats
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      setEquipment([]);
    } finally {
      setLoadingEquipment(false);
    }
  }, [clubId])

  // Check for user reservations on the current day
  const checkUserReservations = useCallback(async () => {
    if (!clubId || isModify) return;
    
    try {
      setLoadingReservations(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const userId = localStorage.getItem('userId');
      const data = await reservationsService.getByClubId(clubId, { userId, date: today });
      
      if (data.reservations && data.reservations.length > 0) {
        setUserReservations(data.reservations);
        setShowReservationFlow(true);
        setShowQuickReservation(false);
      } else {
        // No reservations found - show quick reservation interface
        setShowReservationFlow(false);
        setShowQuickReservation(true);
      }
    } catch (error) {
      console.error('Failed to check reservations:', error);
      // If there's an error, show quick reservation interface
      setShowReservationFlow(false);
      setShowQuickReservation(true);
    } finally {
      setLoadingReservations(false);
    }
  }, [clubId, isModify]);

  // Fetch equipment when modal opens or clubId changes
  useEffect(() => {
    if (show && clubId) {
      fetchEquipment();
      if (!isModify) {
        checkUserReservations();
      }
    }
  }, [show, clubId, fetchEquipment, checkUserReservations, isModify])

  // Initialize form data when paddle is provided (modify mode)
  useEffect(() => {
    console.log('PaddleForm useEffect - paddle:', paddle, 'isModify:', isModify);
    if (paddle && isModify) {
      console.log('Paddle length value:', paddle.length, 'Type:', typeof paddle.length);
      console.log('Paddle visitors value:', paddle.visitors, 'Type:', typeof paddle.visitors);
      console.log('What paddle is here??', paddle)
      const formDataToSet = {
        startTime: formatDateTimeForInput(paddle.startTime),
        endTime: formatDateTimeForInput(paddle.endTime),
        length: paddle.length || null,
        info: paddle.info || '',
        additionalInfo: paddle.additionalInfo || null,
        userId: paddle.userId || localStorage.getItem('userId') || '',
        clubId: paddle.clubId || clubId || '',
        equipmentId: paddle.equipmentId || ''
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [paddle, isModify, clubId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleReservationSelect = (reservation) => {
    setSelectedReservation(reservation);
    setFormData(prev => ({
      ...prev,
      equipmentId: reservation.equipmentId,
      startTime: formatDateTimeForInput(reservation.startTime)
    }));
  };

  const handleStartPaddle = () => {
    if (!selectedReservation || !startTime || !formData.info) {
      alert('Please select a reservation, enter the start time, and provide a route');
      return;
    }

    // Create paddle data from the selected reservation
    const paddleData = {
      startTime: new Date(startTime).toISOString(),
      endTime: null,
      length: null,
      info: formData.info,
      additionalInfo: null,
      userId: parseInt(localStorage.getItem('userId')),
      clubId: parseInt(clubId),
      equipmentId: parseInt(selectedReservation.equipmentId)
    };

    onSubmit(paddleData);
    if (onCancel) onCancel();
  };

  const checkAvailableEquipment = async () => {
    if (!quickReservationData.startTime || !quickReservationData.endTime) return;
    
    try {
      setLoadingAvailableEquipment(true);
      
      // Check for conflicts with existing reservations
      const startTime = new Date(quickReservationData.startTime);
      const endTime = new Date(quickReservationData.endTime);
      
      // Get all equipment for the club
      const allEquipment = await equipmentsService.getByClubId(clubId);
      const equipmentList = allEquipment.equipment || allEquipment;
      
      // Get existing reservations for the time period
      const existingReservations = await reservationsService.getByClubId(clubId, {
        date: startTime.toISOString().split('T')[0]
      });
      
      // Filter out equipment that has conflicts
      const available = equipmentList.filter(equipment => {
        const hasConflict = existingReservations.reservations.some(reservation => {
          if (reservation.equipmentId !== equipment.id) return false;
          
          const reservationStart = new Date(reservation.startTime);
          const reservationEnd = reservation.endTime ? new Date(reservation.endTime) : null;
          
          // Check for time overlap
          if (reservationEnd) {
            return !(endTime <= reservationStart || startTime >= reservationEnd);
          } else {
            // Reservation has no end time, consider it conflicting
            return true;
          }
        });
        
        return !hasConflict;
      });
      
      setAvailableEquipment(available);
    } catch (error) {
      console.error('Failed to check available equipment:', error);
      alert('Failed to check available equipment. Please try again.');
    } finally {
      setLoadingAvailableEquipment(false);
    }
  };

  const handleQuickReservationAndPaddle = async () => {
    if (!selectedEquipment || !startTime || !quickReservationData.startTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // First create the reservation
      const reservationData = {
        startTime: new Date(quickReservationData.startTime).toISOString(),
        endTime: new Date(quickReservationData.endTime).toISOString(),
        equipmentId: parseInt(selectedEquipment.id),
        clubId: parseInt(clubId),
        detail: 'Quick reservation created from paddle form'
      };

      await reservationsService.create(reservationData);
      
      // Then create the paddle
      const paddleData = {
        startTime: new Date(startTime).toISOString(),
        endTime: null,
        length: null,
        info: formData.info || '',
        additionalInfo: null,
        userId: parseInt(localStorage.getItem('userId')),
        clubId: parseInt(clubId),
        equipmentId: parseInt(selectedEquipment.id)
      };

      onSubmit(paddleData);
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to create reservation and paddle:', error);
      alert('Failed to create reservation. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      formData.startTime &&
      formData.userId &&
      formData.clubId &&
      formData.equipmentId
    ) {
      // Convert date and time to proper datetime format for backend
      const startDateTime = new Date(formData.startTime).toISOString();
      const endDateTime = formData.endTime ? new Date(formData.endTime).toISOString() : null;
      
      const paddleData = {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime,
        // Convert numeric fields to proper types
        length: formData.length ? parseFloat(formData.length) : null,
        userId: parseInt(formData.userId),
        clubId: parseInt(formData.clubId),
        equipmentId: parseInt(formData.equipmentId)
      };
      
      onSubmit(paddleData);
      
      // Reset form only if not in modify mode
      if (!isModify) {
        setFormData({
          startTime: getDefaultStartTime(),
          endTime: '',
          length: null,
          info: '',
          additionalInfo: null,
          userId: localStorage.getItem('userId') || '',
          clubId: clubId || '',
          equipmentId: ''
        });
      }
      
      if (onCancel) onCancel();
    } else {
      alert('Please fill in all required fields: Start Time, Equipment ID');
    }
  };

  const handleClose = () => {
    if (onCancel) onCancel();
  };

  // If this is modification mode, show the original form
  if (isModify) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Modify Paddle</Modal.Title>
        </Modal.Header>
        
              <Modal.Body>

        <Form onSubmit={handleSubmit}>
          {/* Row 1: Start Time and Equipment - Always shown */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date & Time *</Form.Label>
                  <Form.Control
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kayak/Canoe/SUP *</Form.Label>
                  <Form.Select
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleInputChange}
                    required
                    disabled={loadingEquipment}
                  >
                    <option value="">{loadingEquipment ? 'Loading equipment...' : 'Select equipment'}</option>
                    {equipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.type})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: Route and Visitors - Always shown */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Route</Form.Label>
                  <Form.Control
                    name="info"
                    as="textarea"
                    value={formData.info}
                    onChange={handleInputChange}
                    placeholder="Enter your paddling route"
                    rows="2"
                  />
                </Form.Group>
              </Col>
              
            </Row>

            {/* Row 3: End Time and Length - Only for modify/end */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Paddling Length (km)</Form.Label>
                  <Form.Control
                    name="length"
                    type="number"
                    step="0.1"
                    min="0"
                    max="999.9"
                    value={formData.length}
                    onChange={handleInputChange}
                    placeholder="e.g., 5.5"
                    onBlur={(e) => {
                      // Ensure valid float value on blur
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setFormData(prev => ({
                          ...prev,
                          length: value.toFixed(1)
                        }));
                      }
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 4: Additional Information - Only for modify/end */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Additional Information</Form.Label>
                  <Form.Control
                    name="additionalInfo"
                    as="textarea"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Enter additional information"
                    rows="2"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Update Paddle
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // Show reservation flow if user has reservations today
  if (showReservationFlow) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Start Paddle from Reservation</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {loadingReservations ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading reservations...</span>
              </div>
              <p className="mt-2">Checking your reservations...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h5>You have reservations for today!</h5>
                <p className="text-muted">Select a reservation to start your paddle:</p>
              </div>

              {/* Reservation Cards */}
              <div className="mb-4">
                {userReservations.map((reservation) => (
                  <Card 
                    key={reservation.id} 
                    className={`mb-2 ${selectedReservation?.id === reservation.id ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleReservationSelect(reservation)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{reservation.equipment?.name}</h6>
                          <small className="text-muted">
                            {new Date(reservation.startTime).toLocaleTimeString('fi-FI', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {reservation.endTime ? 
                              new Date(reservation.endTime).toLocaleTimeString('fi-FI', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 'No end time'
                            }
                          </small>
                        </div>
                        {selectedReservation?.id === reservation.id && (
                          <div className="text-primary">
                            <i className="bi bi-check-circle-fill"></i> Selected
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Start Time Input */}
              {selectedReservation && (
                <div className="mb-4">
                  <p className="text-muted">Insert paddling information:</p>
              
                  <Form.Group>
                    <Form.Label>Exact start time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </div>
              )}

              {/* Route Input */}
              {selectedReservation && (
                <div className="mb-4">
                  <Form.Group>
                    <Form.Label>Route *</Form.Label>
                    <Form.Control
                      name="info"
                      as="textarea"
                      value={formData.info}
                      onChange={handleInputChange}
                      placeholder="Enter your paddling route"
                      rows="2"
                      required
                    />
                    <Form.Text className="text-muted">
                    </Form.Text>
                  </Form.Group>
                </div>
              )}


            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {selectedReservation && (
            <Button 
              variant="primary" 
              onClick={handleStartPaddle}
              disabled={!startTime || !formData.info}
            >
              Start Paddle
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }

  // Show Quick Reservation interface if no reservations found
  if (showQuickReservation) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Reservation Required</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="mb-4">
            <h5>Looks like you don't have a reservation for today</h5>
            <p className="text-muted">Create a quick reservation here to start paddling</p>
          </div>

          <Form>
            {/* Time Selection */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reservation Start *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={quickReservationData.startTime}
                    onChange={(e) => setQuickReservationData(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reservation End *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    onChange={(e) => setQuickReservationData(prev => ({
                      ...prev,
                      endTime: e.target.value
                    }))}
                    min={quickReservationData.startTime}
                    required
                  />
                  <Form.Text className="text-muted">
                  If you're not sure when you'll finish, it's a good idea to reserve the whole day. The reservation will automatically end when you finish your paddle.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Available Equipment */}
            {quickReservationData.startTime && quickReservationData.endTime && (
              <div className="mb-3">
                <Button 
                  variant="outline-primary" 
                  onClick={() => checkAvailableEquipment()}
                  disabled={loadingAvailableEquipment}
                >
                  {loadingAvailableEquipment ? 'Checking...' : 'Check Available Equipment'}
                </Button>
              </div>
            )}

            {availableEquipment.length > 0 && (
              <div className="mb-4">
                <h6>Available Equipment:</h6>
                <div className="row">
                  {availableEquipment.map((item) => (
                    <div key={item.id} className="col-md-6 mb-2">
                      <Card 
                        className={`${selectedEquipment?.id === item.id ? 'border-primary' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedEquipment(item)}
                      >
                        <Card.Body className="py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">{item.type}</small>
                            </div>
                            {selectedEquipment?.id === item.id && (
                              <div className="text-primary">
                                <i className="bi bi-check-circle-fill"></i> Selected
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paddle Details (shown after equipment selection) */}
            {selectedEquipment && (
              <div className="mt-4 pt-3 border-top">
                <h6>Paddle Details:</h6>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Actual Start Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Route *</Form.Label>
                      <Form.Control
                        name="info"
                        as="textarea"
                        value={formData.info}
                        onChange={handleInputChange}
                        placeholder="Enter your paddling route"
                        rows="2"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}


          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {selectedEquipment && (
            <Button 
              variant="primary" 
              onClick={handleQuickReservationAndPaddle}
              disabled={!startTime || !quickReservationData.startTime || !quickReservationData.endTime}
            >
          Create Reservation & Start Paddle
        </Button>
            )}
        </Modal.Footer>
      </Modal>
    );
  }

  // Show the original form if no reservations or in fallback mode
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Paddle</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Row 1: Start Time and Equipment - Always shown */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date & Time *</Form.Label>
                <Form.Control
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Kayak/Canoe/SUP *</Form.Label>
                <Form.Select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleInputChange}
                  required
                  disabled={loadingEquipment}
                >
                  <option value="">{loadingEquipment ? 'Loading equipment...' : 'Select equipment'}</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Row 2: Route and Visitors - Always shown */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Route</Form.Label>
                <Form.Control
                  name="info"
                  as="textarea"
                  value={formData.info}
                  onChange={handleInputChange}
                  placeholder="Enter your paddling route"
                  rows="2"
                />
              </Form.Group>
            </Col>

          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Paddle
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PaddleForm; 