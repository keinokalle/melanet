import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';
import MenuIcon from '../assets/Menu.svg';
import UserImage from '../assets/User.svg'

function Header({ isLoggedIn, onLogout, userMemberships, onNavigate, loading }) {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClose = () => {
    console.log('Hiding the menu');
    setShowOffcanvas(false)
  }
  
  const handleShow = () => {
    console.log('Showing the menu');
    setShowOffcanvas(true)
  }

  const handleNavigate = (section) => {
    // Use the first club's ID for navigation
    onNavigate(section)
    handleClose(); // Close offcanvas after navigation
  };

  return (
    <>
      <Navbar className="top-header" fixed="top">
        <Container fluid>
          <div className="d-flex align-items-center">
            <img 
              src={MenuIcon} 
              alt="Menu" 
              className="header-menu-icon d-md-none me-3" 
              onClick={handleShow}
              style={{ cursor: 'pointer' }}
            />
            <Navbar.Brand href="#" className="text-dark fw-bold">Melanet</Navbar.Brand>
          </div>
          
          <div className="ms-auto">
          {isLoggedIn && (
            <Button variant="outline-secondary" size="sm" onClick={onLogout}>
              Logout
            </Button>
          )}
          <img
            src={UserImage}
            alt="User"
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: '1rem', verticalAlign: 'middle' }}
          />
          </div>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu - Rendered at root level */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        placement="start"
        className="d-md-none"
      >
        <Offcanvas.Header closeButton>
          <img
            src={UserImage}
            alt="User"
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: '1rem', verticalAlign: 'middle' }}
          />
          <Offcanvas.Title>{localStorage.getItem('name')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading clubs...</div>
            </div>
          ) : !isLoggedIn ? (
            <div className="alert alert-info">Please log in to see your clubs</div>
          ) : userMemberships.length === 0 ? (
            <div className="alert alert-warning">No club memberships found</div>
          ) : (
            <Nav className="flex-column">
              <Nav.Link href="#home">Home</Nav.Link>
              <Button 
                variant="outline-secondary" 
                className="w-100 mb-2 text-start"
                onClick={() => handleNavigate('logbook')}
              >
                Logbook
              </Button>
              <Button 
                variant="outline-secondary" 
                className="w-100 mb-2 text-start"
                onClick={() => handleNavigate('reservationCalendar')}
              >
                Reservation Calendar
              </Button>
              <Button 
                variant="outline-secondary" 
                className="w-100 mb-2 text-start"
                onClick={() => handleNavigate('equipment')}
              >
                Equipment
              </Button>
              <Button 
                variant="outline-secondary" 
                className="w-100 mb-2 text-start"
                onClick={() => handleNavigate('statistics')}
              >
                Statistics
              </Button>
            </Nav>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default Header;