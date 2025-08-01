import { useState } from 'react'

/**
 * Logbook entry form for adding a new paddle.
 * @param {Object} props
 * @param {Function} props.onAdd - Called with new paddle data when form is submitted.
 * @param {Function} [props.onCancel] - Called when the form is cancelled.
 * @param {string} props.clubId - The ID of the current club
 * @returns {JSX.Element} – An popup window for adding the new paddling data
 */

function Form({ onAdd, onCancel, clubId }) {
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

  const [newPaddle, setNewPaddle] = useState({
    startTime: getDefaultStartTime(),
    endTime: getDefaultStartTime(), // '',
    info: '',
    userId: localStorage.getItem('userId') || '',
    clubId: clubId || '',
    equipmentId: 1 // ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaddle(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPaddle = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      newPaddle.startTime &&
      newPaddle.userId &&
      newPaddle.clubId &&
      newPaddle.equipmentId
    ) {
      // Convert date and time to proper datetime format for backend
      const startDateTime = new Date(newPaddle.startTime).toISOString();
      const endDateTime = newPaddle.endTime ? new Date(newPaddle.endTime).toISOString() : null;
      
      const paddleData = {
        ...newPaddle,
        startTime: startDateTime,
        endTime: endDateTime
      };
      
      onAdd(paddleData);
      setNewPaddle({
        startTime: getDefaultStartTime(),
        endTime: '',
        info: '',
        userId: localStorage.getItem('userId') || '',
        clubId: clubId || '',
        equipmentId: ''
      });
      if (onCancel) onCancel();
    } else {
      alert('Please fill in all required fields: Start Time, Equipment ID');
    }
  };

  return (
    <>
      <div className="formBackdrop" onClick={onCancel} />
      <div className="formModal">
        <form onSubmit={handleAddPaddle}>
          <input
            name="startTime"
            type="datetime-local"
            value={newPaddle.startTime}
            onChange={handleInputChange}
            placeholder="Start Date & Time"
            required
          />
          <input
            name="endTime"
            type="datetime-local"
            value={newPaddle.endTime}
            onChange={handleInputChange}
            placeholder="End Date & Time (optional)"
          />
          <input
            name="equipmentId"
            type="number"
            value={newPaddle.equipmentId}
            onChange={handleInputChange}
            placeholder="Equipment ID"
            required
          />
          <textarea
            name="info"
            value={newPaddle.info}
            onChange={handleInputChange}
            placeholder="Additional Information (optional)"
            rows="3"
          />
          <button type="submit">Add Paddle</button>
          {onCancel && (
            <button type="button" onClick={onCancel}>Cancel</button>
          )}
        </form>
      </div>
    </>
  )
}

export default Form;