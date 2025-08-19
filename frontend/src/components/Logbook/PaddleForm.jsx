import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import equipmentsService from '../../services/equipments'

/**
 * Shared form component for creating and modifying paddle events.
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
  const [equipment, setEquipment] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)

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
    length: '',
    info: '',
    additionalInfo: '',
    visitors: 0,
    userId: localStorage.getItem('userId') || '',
    clubId: clubId || '',
    equipmentId: ''
  });

  // Fetch equipment when modal opens or clubId changes
  useEffect(() => {
    if (show && clubId) {
      fetchEquipment();
    }
  }, [show, clubId]);

  // Initialize form data when paddle is provided (modify mode)
  useEffect(() => {
    console.log('PaddleForm useEffect - paddle:', paddle, 'isModify:', isModify);
    if (paddle && isModify) {
      const formDataToSet = {
        startTime: formatDateTimeForInput(paddle.startTime),
        endTime: formatDateTimeForInput(paddle.endTime),
        length: paddle.length || '',
        info: paddle.info || '',
        additionalInfo: paddle.additionalInfo || '',
        visitors: paddle.visitors || 0,
        userId: paddle.userId || localStorage.getItem('userId') || '',
        clubId: paddle.clubId || clubId || '',
        equipmentId: paddle.equipmentId || ''
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [paddle, isModify, clubId]);

  const fetchEquipment = async () => {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVisitorsChange = (increment) => {
    const newValue = Math.max(0, formData.visitors + increment);
    setFormData(prev => ({
      ...prev,
      visitors: newValue
    }));
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
        visitors: parseInt(formData.visitors) || 0,
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
          length: '',
          info: '',
          additionalInfo: '',
          visitors: 0,
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

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isModify ? 'Modify Paddle' : 'Add New Paddle'}</Modal.Title>
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
            <Col md={6}>
              <Form.Group>
                <Form.Label>Visitors</Form.Label>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleVisitorsChange(-1)}
                    disabled={formData.visitors <= 0}
                  >
                    -
                  </Button>
                  <span className="mx-3 fw-bold">{formData.visitors}</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleVisitorsChange(1)}
                  >
                    +
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Additional fields - Only shown when modifying or ending a paddle */}
          {(isModify || formData.endTime) && (
            <>
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
            </>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isModify ? 'Update Paddle' : 'Add Paddle'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PaddleForm; 