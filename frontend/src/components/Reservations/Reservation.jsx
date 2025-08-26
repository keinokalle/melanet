import { Card, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import UserIcon from '../../assets/User.svg';
import ArrowIcon from '../../assets/Arrow.svg';

/**
 * Reservation card component for displaying a single reservation entry.
 */

function Reservation({ reservation, onDelete, onModify }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log(reservation)
  // Destructure all the properties from the reservation object
  const { id, startTime, endTime, equipment, user, detail, canEdit, clubId, equipmentId } = reservation

  // Format the date for subtitle
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'Date not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fi-FI', {
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

  // Format the end time
  const formatEndTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate reservation status
  const calculateStatus = () => {
    if (!endTime) return 'Active';
    const now = new Date();
    const end = new Date(endTime);
    return now > end ? 'Completed' : 'Active';
  };

  const status = calculateStatus();

  // Determine background color based on status
  const getBackgroundColor = () => {
    return status === 'Active' ? 'var(--color-primary)' : '#fff';
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
        {/* Card.Subtitle with user icon, name and date */}
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
              {user?.name || user?.username || 'Unknown User'}<br />
              {formatDate(startTime)} • {formatStartTime(startTime)}
            </span>
          </small>
        </Card.Subtitle>
        
        {/* Card.Title with detail */}
        <div className="mb-3">
          <div style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
            {detail || 'No additional information'}
          </div>
        </div>
        
        {/* Equipment and time information - flexbox layout */}
        <div className="mb-3">
          <div className="d-flex justify-content-start" style={{ gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text)', fontWeight: '450' }}>Equipment</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                {equipment?.name || 'Unknown Equipment'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text)', fontWeight: '450' }}>Start Time</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatDate(startTime)}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatStartTime(startTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text)', fontWeight: '450' }}>End Time</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatDate(endTime)}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{formatEndTime(endTime)}</div>
            </div>
          </div>
        </div>

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
                    console.log('Modify button clicked with reservation data:', {id, startTime, endTime, equipment, user, detail, clubId, equipmentId});
                    onModify({id, startTime, endTime, equipment, user, detail, clubId, equipmentId});
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

export default Reservation;
