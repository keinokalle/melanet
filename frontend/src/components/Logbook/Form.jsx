import { useState } from 'react'

/**
 * Logbook entry form for adding a new paddle.
 * @param {Object} props
 * @param {Function} props.onAdd - Called with new paddle data when form is submitted.
 * @param {Function} [props.onCancel] - Called when the form is cancelled.
 * @returns {JSX.Element} – An popup window for adding the new paddling data
 */

function Form({ onAdd, onCancel }) {
  const [newPaddle, setNewPaddle] = useState({
    date: '',
    name: '',
    kayak: '',
    route: '',
    starttime: '',
    endtime: '',
    status: '',
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
    if (
      newPaddle.date &&
      newPaddle.name &&
      newPaddle.kayak &&
      newPaddle.route &&
      newPaddle.starttime &&
      newPaddle.status
    ) {
      onAdd({ ...newPaddle });
      setNewPaddle({
        date: '',
        name: '',
        kayak: '',
        route: '',
        starttime: '',
        endtime: '',
        status: '',
      });
      if (onCancel) onCancel();
    }
  };

  return (
    <>
      <div className="formBackdrop" onClick={onCancel} />
      <div className="formModal">
        <form onSubmit={handleAddPaddle}>
          <input
            name="date"
            type="date"
            value={newPaddle.date}
            onChange={handleInputChange}
            placeholder="Date"
            required
          />
          <input
            name="name"
            value={newPaddle.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
          <input
            name="kayak"
            value={newPaddle.kayak}
            onChange={handleInputChange}
            placeholder="Kayak"
            required
          />
          <input
            name="route"
            value={newPaddle.route}
            onChange={handleInputChange}
            placeholder="Route"
            required
          />
          <input
            name="starttime"
            type="time"
            value={newPaddle.starttime}
            onChange={handleInputChange}
            placeholder="Start Time"
            required
          />
          <input
            name="endtime"
            type="time"
            value={newPaddle.endtime}
            onChange={handleInputChange}
            placeholder="End Time"
          />
          <select
            name="status"
            value={newPaddle.status}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Status</option>
            <option value="Completed">Completed</option>
            <option value="In progress">In progress</option>
            <option value="Planned">Planned</option>
          </select>
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