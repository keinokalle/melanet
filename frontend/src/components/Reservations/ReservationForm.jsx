import { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import equipmentsService from '../../services/equipments'
import reservationsService from '../../services/reservations'

/**
 * Form component for creating and modifying reservations.
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with reservation data when form is submitted.
 * @param {Function} [props.onCancel] - Called when the form is cancelled.
 * @param {string} props.clubId - The ID of the current club
 * @param {Object} [props.reservation] - Reservation data for modification mode
 * @param {boolean} [props.isModify] - Whether this is modification mode
 * @param {boolean} props.show - Whether the modal should be shown
 * @returns {JSX.Element} – A Bootstrap modal for adding or modifying reservation data
 */

function ReservationForm({ onSubmit, onCancel, clubId, reservation = null, isModify = false, show = false }) {
  const [equipment, setEquipment] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [loadingOverlapCheck, setLoadingOverlapCheck] = useState(false)

  // Calculate default start time (current time + 10 minutes) in Finland timezone
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    
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
    detail: '',
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

  // Check for overlapping reservations and time validation
  const checkOverlaps = useCallback(async (equipmentId) => {
    if (!equipmentId || !formData.startTime || !formData.endTime) {
      setAlertInfo(null);
      return;
    }

    const selectedStartTime = new Date(formData.startTime);
    const selectedEndTime = new Date(formData.endTime);
    
    // Check if start time is before end time
    if (selectedStartTime >= selectedEndTime) {
      setAlertInfo({
        type: 'incorrect',
        message: 'Start time must be before end time'
      });
      return;
    }

    try {
      setLoadingOverlapCheck(true);
      const data = await reservationsService.getByClubId(clubId, { 
        equipmentId: equipmentId,
        showActive: 'true'
      });
      
      // Find all overlapping reservations
      const overlappingReservations = data.reservations.filter(r => {
        const reservationStart = new Date(r.startTime);
        const reservationEnd = new Date(r.endTime);
        
        // Check if there's any overlap
        return !(selectedEndTime <= reservationStart || selectedStartTime >= reservationEnd);
      });
      
      if (overlappingReservations.length > 0) {
        setAlertInfo({
          type: 'overlap',
          reservations: overlappingReservations
        });
      } else {
        setAlertInfo({
          type: 'no-overlap',
          reservations: []
        });
      }
    } catch (error) {
      console.error('Failed to check overlaps:', error);
      setAlertInfo(null);
    } finally {
      setLoadingOverlapCheck(false);
    }
  }, [clubId, formData.startTime, formData.endTime])

  // Fetch equipment when modal opens or clubId changes
  useEffect(() => {
    if (show && clubId) {
      fetchEquipment()
    }
  }, [show, clubId, fetchEquipment])

  // Check overlaps when equipment, start time, or end time changes
  useEffect(() => {
    if (formData.equipmentId) {
      checkOverlaps(formData.equipmentId);
    }
  }, [formData.equipmentId, formData.startTime, formData.endTime, checkOverlaps])

  // Initialize form data when reservation is provided (modify mode)
  useEffect(() => {
    if (reservation && isModify) {
      const formDataToSet = {
        startTime: formatDateTimeForInput(reservation.startTime),
        endTime: formatDateTimeForInput(reservation.endTime),
        detail: reservation.detail || '',
        userId: reservation.userId || localStorage.getItem('userId') || '',
        clubId: reservation.clubId || clubId || '',
        equipmentId: reservation.equipmentId || ''
      };
      setFormData(formDataToSet);
    }
  }, [reservation, isModify, clubId])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.startTime || !formData.endTime || !formData.equipmentId || !formData.clubId) {
      alert('Please fill in all required fields: Start Time, End Time, Equipment');
      return;
    }

    // Validate that end time is after start time
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      alert('End time must be after start time');
      return
    }

    // Convert date and time to proper datetime format for backend
    const startDateTime = new Date(formData.startTime).toISOString();
    const endDateTime = formData.endTime ? new Date(formData.endTime).toISOString() : null;
    
    const reservationData = {
      ...formData,
      startTime: startDateTime,
      endTime: endDateTime
    };
    
    onSubmit(reservationData);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      startTime: getDefaultStartTime(),
      endTime: '',
      detail: '',
      userId: localStorage.getItem('userId') || '',
      clubId: clubId || '',
      equipmentId: ''
    });
    setAlertInfo(null);
    onCancel();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isModify ? 'Modify Reservation' : 'New Reservation'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            {/* Equipment Selection */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Equipment *</Form.Label>
                <Form.Select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleInputChange}
                  required
                  disabled={loadingEquipment}
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}: {item.name}
                    </option>
                  ))}
                </Form.Select>
                {loadingEquipment && <small className="text-muted">Loading equipment...</small>}
              </Form.Group>
            </Col>

            {/* Start Time */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* End Time */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Overlap Info */}
            <Col md={6}>
              {formData.equipmentId && formData.startTime && formData.endTime && (
                <div className="mb-3">
                  {loadingOverlapCheck ? (
                    <div className="text-muted">Checking availability...</div>
                  ) : alertInfo ? (
                    alertInfo.type === 'incorrect' ? (
                      <Alert variant="warning" className="py-2">
                        <small>
                          <strong>{alertInfo.message}</strong>
                        </small>
                      </Alert>
                    ) : alertInfo.type === 'overlap' ? (
                      <Alert variant="danger" className="py-2">
                        <small>
                          <strong>Overlapping reservations found:</strong><br />
                          {alertInfo.reservations.map((r) => (
                            <div key={r.id} className="mb-1">
                              {new Date(r.startTime).toLocaleDateString('fi-FI')} {new Date(r.startTime).toLocaleTimeString('fi-FI', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(r.endTime).toLocaleTimeString('fi-FI', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ))}
                        </small>
                      </Alert>
                    ) : (
                      <Alert variant="success" className="py-2">
                        <small>No overlapping reservations</small>
                      </Alert>
                    )
                  ) : (
                    <div className="text-muted">Set start and end times to check for overlaps</div>
                  )}
                </div>
              )}
            </Col>
          </Row>

          {/* Detail/Explanation */}
          <Form.Group className="mb-3">
            <Form.Label>Explanation (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="detail"
              value={formData.detail}
              onChange={handleInputChange}
              placeholder="Add any additional details about your reservation..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={alertInfo && (alertInfo.type === 'overlap' || alertInfo.type === 'incorrect')}
          >
            {isModify ? 'Update Reservation' : 'Create Reservation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ReservationForm
