/**
 * Paddle card component for displaying a single logbook entry.
 */

function Paddle({ paddle, onDelete, onModify }) {
  // Destructure all the properties from the paddle object
  const { id, startTime, endTime, equipment, user, info, canEdit, clubId, equipmentId } = paddle;

  // Format the datetime strings for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const calculateStatus = () => {
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const end = endTime ? new Date(endTime) : null;

    // If no start time, it's planned
    if (!start) {
      return 'Planned';
    }

    // If start time is in the future, it's scheduled
    if (start > now) {
      return 'Scheduled';
    }

    // If no end time, it's in progress
    if (!end) {
      return 'In Progress';
    }

    // If end time is in the future, it's in progress
    if (end > now) {
      return 'In Progress';
    }

    // If end time is in the past, it's completed
    return 'Completed';
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Completed':
        return 'paddleStatusCompleted';
      case 'In Progress':
        return 'paddleStatusInProgress';
      case 'Scheduled':
        return 'paddleStatusScheduled';
      case 'Planned':
        return 'paddleStatusPlanned';
      default:
        return 'paddleStatusCompleted';
    }
  };

  const status = calculateStatus();

  return (
    <div className="paddleCard">
      {canEdit && (
        <div className="paddleCardOptions">
          <button onClick={() => {
            console.log('Modify button clicked with paddle data:', {id, startTime, endTime, equipment, user, info, clubId, equipmentId});
            onModify({id, startTime, endTime, equipment, user, info, clubId, equipmentId});
          }}>Modify</button>
          <button onClick={() => onDelete(id)} >Delete</button>
        </div>
      )}
      <div className="paddleRow">
        <span className="paddleLabel">Start Time:</span> 
        {formatDateTime(startTime)}
      </div>
      <div className="paddleRow">
        <span className="paddleLabel">End Time:</span> 
        {formatDateTime(endTime)}
      </div>
      <div className="paddleRow">
        <span className="paddleLabel">Equipment:</span> 
        {`${equipment.name} (${equipment.type})`}
      </div>
      <div className="paddleRow">
        <span className="paddleLabel">User:</span> 
        {user.name}
      </div>
      {info && (
        <div className="paddleRow">
          <span className="paddleLabel">Info:</span> 
          {info}
        </div>
      )}
      <div className="paddleRow">
        <span className="paddleLabel">Status:</span> 
        <span className={`paddleStatus ${getStatusClassName(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default Paddle; 