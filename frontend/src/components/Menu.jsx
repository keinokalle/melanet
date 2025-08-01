import { useState } from 'react';

function Menu({ isLoggedIn, userMemberships, onNavigate, loading }) {
  const [expandedClubs, setExpandedClubs] = useState({});

  const toggleClubExpansion = (clubId) => {
    setExpandedClubs(prev => ({
      ...prev,
      [clubId]: !prev[clubId]
    }));
  };

  const handleSectionClick = (clubId, section) => {
    onNavigate(clubId, section);
  };

  if (loading) {
    return (
      <nav>
        <div>Loading clubs...</div>
      </nav>
    );
  }

  if (!isLoggedIn) {
    return (
      <nav>
        <div>Please log in to see your clubs</div>
      </nav>
    );
  }

  if (userMemberships.length === 0) {
    return (
      <nav>
        <div>No club memberships found</div>
      </nav>
    );
  }

  return (
    <nav>
      {userMemberships.map(membership => (
        <div key={membership.clubId} className="club-menu">
          <button 
            className="club-header"
            onClick={() => toggleClubExpansion(membership.clubId)}
          >
            {membership.club.name} {expandedClubs[membership.clubId] ? '▼' : '▶'}
          </button>
          {expandedClubs[membership.clubId] && (
            <div className="club-sections">
              <button onClick={() => handleSectionClick(membership.clubId, 'logbook')}>
                Logbook
              </button>
              <button onClick={() => handleSectionClick(membership.clubId, 'reservationCalendar')}>
                Reservation Calendar
              </button>
              <button onClick={() => handleSectionClick(membership.clubId, 'equipment')}>
                Equipment
              </button>
              <button onClick={() => handleSectionClick(membership.clubId, 'statistics')}>
                Statistics
              </button>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Menu;
