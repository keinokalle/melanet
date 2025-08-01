import { useState, useEffect } from 'react'

/**
 * Shared form component for creating and modifying paddle events.
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with paddle data when form is submitted.
 * @param {Function} [props.onCancel] - Called when the form is cancelled.
 * @param {string} props.clubId - The ID of the current club
 * @param {Object} [props.paddle] - Paddle data for modification mode
 * @param {boolean} [props.isModify] - Whether this is modification mode
 * @returns {JSX.Element} – A popup window for adding or modifying paddle data
 */

function PaddleForm({ onSubmit, onCancel, clubId, paddle = null, isModify = false }) {
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
    info: '',
    userId: localStorage.getItem('userId') || '',
    clubId: clubId || '',
    equipmentId: ''
  });

  // Initialize form data when paddle is provided (modify mode)
  useEffect(() => {
    console.log('PaddleForm useEffect - paddle:', paddle, 'isModify:', isModify);
    if (paddle && isModify) {
      const formDataToSet = {
        startTime: formatDateTimeForInput(paddle.startTime),
        endTime: formatDateTimeForInput(paddle.endTime),
        info: paddle.info || '',
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
        endTime: endDateTime
      };
      
      onSubmit(paddleData);
      
      // Reset form only if not in modify mode
      if (!isModify) {
        setFormData({
          startTime: getDefaultStartTime(),
          endTime: '',
          info: '',
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

  return (
    <>
      <div className="formBackdrop" onClick={onCancel} />
      <div className="formModal">
        <form onSubmit={handleSubmit}>
          <h3>{isModify ? 'Modify Paddle' : 'Add New Paddle'}</h3>
          <input
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleInputChange}
            placeholder="Start Date & Time"
            required
          />
          <input
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleInputChange}
            placeholder="End Date & Time (optional)"
          />
          <input
            name="equipmentId"
            type="number"
            value={formData.equipmentId}
            onChange={handleInputChange}
            placeholder="Equipment ID"
            required
          />
          <textarea
            name="info"
            value={formData.info}
            onChange={handleInputChange}
            placeholder="Additional Information (optional)"
            rows="3"
          />
          <button type="submit">
            {isModify ? 'Update Paddle' : 'Add Paddle'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>Cancel</button>
          )}
        </form>
      </div>
    </>
  )
}

export default PaddleForm; 