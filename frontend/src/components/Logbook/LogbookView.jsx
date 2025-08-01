import Paddle from './Paddle'
import { useEffect, useState } from 'react'
import PaddleForm from './PaddleForm'
import paddlesService from '../../services/paddles'
import clubsService from '../../services/clubs'

/**
 * Displays the full logbook page, including the list of paddling entries and the form to add new entries.
 * @component 
 * @param {Object} props - Component props
 * @param {string} props.clubId - The ID of the current club
 * @returns {JSX.Element} The rendered logbook view.
 */

function LogbookView({ clubId }) {
  const [paddles, setPaddles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [modifyPaddle, setModifyPaddle] = useState(null)
  const [clubName, setClubName] = useState('')

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [showActive, setShowActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clubId) {
      clubsService.getById(clubId)
        .then(club => {
          setClubName(club.name)
        })
        .catch(err => {
          console.error('Failed to fetch club:', err);
          setClubName('Unknown Club')
        })
    }
  }, [clubId])

  useEffect(() => {
    fetchPaddles()
  }, [clubId, currentPage, itemsPerPage, showActive])

  const fetchPaddles = () => {
    if (!clubId) return;
    
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      showActive: showActive.toString()
    });

    paddlesService.getByClubId(clubId, queryParams)
      .then(data => {
        console.log('this is what we get', data)
        setPaddles(data.paddles)
        setTotalPages(data.pagination.totalPages)
        setTotalItems(data.pagination.totalItems)
        console.log("fetched paddles successfully")
      })
      .catch(err => {
        console.error('Failed to fetch paddles:', err);
        setPaddles([]);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  }

  const handleShowActiveChange = (newShowActive) => {
    setShowActive(newShowActive);
    setCurrentPage(1); // Reset to first page when changing filter
  }

  const handleSubmitPaddle = (paddleData) => {
    if (modifyPaddle) {
      // Update existing paddle
      paddlesService.update(modifyPaddle.id, paddleData)
        .then(updatedPaddle => {
          setPaddles(prev => prev.map(p => p.id === modifyPaddle.id ? updatedPaddle : p));
          setModifyPaddle(null);
        })
        .catch(err => {
          console.error('Failed to update paddle:', err);
        })
    } else {
      // Create new paddle
      paddlesService.create(paddleData)
        .then(createdPaddle => {
          setPaddles(prev => [createdPaddle, ...prev]);
          // Refresh the list to get updated pagination
          fetchPaddles();
        })
        .catch(err => {
          console.error('Failed to create paddle:', err);
        })
    }
  }

  const handleModifyPaddle = (paddle) => {
    console.log('handleModifyPaddle called with:', paddle);
    setModifyPaddle(paddle);
  }

  const handleDeletePaddle = (paddleId) => {
    console.log("YOU WANT TO DELETE???");
    
    paddlesService.remove(paddleId)
      .then(() => {
        // Refresh the list to get updated pagination
        fetchPaddles();
      })
      .catch(err => {
        console.error('Failed to delete paddle:', err);
      })
  }

  const handleCancelForm = () => {
    setShowForm(false);
    setModifyPaddle(null);
  }

  return (
    <div>
      {clubId && <h2>Logbook of Club {clubName}</h2>}
      
      {/* Controls Section */}
      <div className="logbook-controls">
        <div className="control-group">
          <label>Show:</label>
          <button 
            className={showActive ? 'active' : ''} 
            onClick={() => handleShowActiveChange(true)}
          >
            Active
          </button>
          <button 
            className={!showActive ? 'active' : ''} 
            onClick={() => handleShowActiveChange(false)}
          >
            All
          </button>
        </div>

        <div className="control-group">
          <label>Items per page:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <button onClick={() => setShowForm(s => !s)}>
        {showForm ? 'Cancel' : 'New Paddle'}
      </button>
      
      {(showForm || modifyPaddle) && (
        <PaddleForm 
          onSubmit={handleSubmitPaddle} 
          onCancel={handleCancelForm} 
          clubId={clubId}
          paddle={modifyPaddle}
          isModify={!!modifyPaddle}
        />
      )}

      {loading && <div>Loading paddles...</div>}

      <div className="paddleList">
        {paddles
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          .map((paddle, idx) => (
            <Paddle key={idx} paddle={paddle} onDelete={handleDeletePaddle} onModify={handleModifyPaddle}/> 
          ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <div className="pagination-info">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} paddles
        </div>
        
        <div className="pagination-buttons">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogbookView;