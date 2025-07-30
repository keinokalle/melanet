function Menu({ onNavigate }) {
  return (
    <nav>
      <button onClick={() => onNavigate('logbook')}>Logbook</button>
      <button onClick={() => onNavigate('reservationCalendar')}>Reservation Calendar</button>
      <button onClick={() => onNavigate('equipment')}>Equipment</button>
      <button onClick={() => onNavigate('statistics')}>Statistics</button>
      <button onClick={() => onNavigate('login')}>Login</button>
    </nav>
  );
}

export default Menu;
