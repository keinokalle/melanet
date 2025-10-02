import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import InfoIcon from '../assets/Info.svg'

/**
 * A reusable modal component for displaying page instructions
 * Opened via info buttons
 */
function InfoModal({ show, onHide, title, content }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <img
            src={InfoIcon}
            alt="Info"
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default InfoModal
