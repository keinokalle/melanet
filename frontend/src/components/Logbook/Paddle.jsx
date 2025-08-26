import { Card, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import UserIcon from '../../assets/User.svg';
import ArrowIcon from '../../assets/Arrow.svg';

/**
 * Paddle card component for displaying a single logbook entry.
 */

function Paddle({ paddle, onDelete, onModify }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log(paddle)
  // Destructure all the properties from the paddle object
  const { id, startTime, endTime, equipment, user, info, canEdit, clubId, equipmentId, length, additionalInfo } = paddle

  // Format the date for subtitle
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'Date not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format the start time
  const formatStartTime = (dateTimeString) => {
    if (!dateTimeString) return 'Time not set';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total time
  const calculateTotalTime = () => {
    if (!startTime || !endTime) return 'Time not available';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const calculatePace = () => {
    if (!length || !startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMinutes = diffMs / (1000 * 60);
    
    if (diffMinutes <= 0 || length <= 0) return 'N/A';
    
    const paceMinutesPerKm = diffMinutes / length;
    const paceMinutes = Math.floor(paceMinutesPerKm);
    const paceSeconds = Math.round((paceMinutesPerKm - paceMinutes) * 60);
    
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} /km`;
  };

  const calculateStatus = () => {
    // Simple: if endTime exists, it's completed, otherwise it's in progress
    return endTime ? 'Completed' : 'In Progress';
  };



  const status = calculateStatus();

  // Determine background color based on status
  const getBackgroundColor = () => {
    return status === 'In Progress' ? 'var(--color-primary)' : '#fff';
  };

  const handleCardClick = () => {
    if (canEdit) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className="mb-3 shadow-sm" 
      onClick={handleCardClick}
      style={{ 
        cursor: canEdit ? 'pointer' : 'default',
        backgroundColor: getBackgroundColor(),
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        if (canEdit) {
          e.currentTarget.style.filter = 'brightness(1.1) saturate(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (canEdit) {
          e.currentTarget.style.filter = 'brightness(1) saturate(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
    >
      <Card.Body>
                  {/* Card.Subtitle with date and start time */}
          <Card.Subtitle className="mb-2 text-muted d-flex justify-content-between align-items-center">
            
            <small style={{ fontSize: '0.7em' }} className="text-muted d-flex align-items-start">
              <img 
                src={UserIcon} 
                alt="User" 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  marginRight: '8px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <span>
                {user.name}<br />
                {formatDate(startTime)} • {formatStartTime(startTime)}
              </span>
            </small>
          </Card.Subtitle>
        
        {/* Card.Title with info */}
        <div className="mb-3">
          <div style={{ fontSize: '0.95rem', color: 'var(--color-text' }}>
            {info || 'No additional information'}
          </div>
        </div>
        
        {/* Equipment and total time information */}
        {status === 'Completed' ? (
          // Grid layout for completed paddles
          <div className="mb-3">
            <div className="d-flex justify-content-start" style={{ gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>Length</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{length ? `${length} km` : 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>Time</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{calculateTotalTime()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>Pace</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{calculatePace()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>{equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{equipment.name}</div>
              </div>
            </div>
          </div>
        ) : (
          // Flexbox layout for in-progress paddles (same structure as completed)
          <div className="mb-3">
            <div className="d-flex justify-content-start" style={{ gap: '20px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#dc3545' }}>
                  <span className="blinking-dot"></span> Active
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>Started</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatStartTime(startTime)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text', fontWeight: '450' }}>{equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{equipment.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information - shown if it exists */}
        {additionalInfo && (
          <div className="mb-3">
            <div style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>
              <strong>Paddler's comment:</strong> {additionalInfo}
            </div>
          </div>
        )}

        {/* Chevron indicator in bottom right */}
        {canEdit && (
          <div className="d-flex justify-content-end mt-3">
            <img 
              src={ArrowIcon} 
              alt="Expand" 
              style={{ 
                width: '15px', 
                height: '9px',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-in-out'
              }} 
            />
          </div>
        )}

        {/* Modify and Delete buttons - only shown when expanded */}
        {isExpanded && canEdit && (
          <>
            <hr className="my-3" />
            <div 
              className="slide-in-buttons"
              style={{
                animation: 'slideIn 0.3s ease-out forwards'
              }}
            >
              <div className="btn-group w-100" role="group">
                <Button 
                  variant="primary" 
                  size="sm"
                  className="flex-fill"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Modify button clicked with paddle data:', {id, startTime, endTime, equipment, user, info, clubId, equipmentId});
                    onModify({id, startTime, endTime, equipment, user, info, clubId, equipmentId, length, additionalInfo});
                  }}
                >
                  Modify
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  className="flex-fill"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default Paddle; 