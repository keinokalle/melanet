/**
 * Paddle card component for displaying a single logbook entry.
 * 
 * @param {Object} props
 * @param {string} props.date - The date of the paddle.
 * @param {string} props.name - The name of the paddler.
 * @param {string} props.kayak - The kayak used.
 * @param {string} props.route - The paddling route.
 * @param {string} props.starttime - The start time of the paddle.
 * @param {string} props.endtime - The end time of the paddle.
 * @param {string} props.status - The status of the paddle (e.g., "Completed", "In progress").
 * @returns {JSX.Element} The rendered paddle card.
 */

function Paddle({ date, name, kayak, route, starttime, endtime, status }) {
  return (
    <div className="paddleCard">
      <div className="paddleRow"><span className="paddleLabel">Date:</span> {date}</div>
      <div className="paddleRow"><span className="paddleLabel">Name:</span> {name}</div>
      <div className="paddleRow"><span className="paddleLabel">Kayak:</span> {kayak}</div>
      <div className="paddleRow"><span className="paddleLabel">Route:</span> {route}</div>
      <div className="paddleRow"><span className="paddleLabel">Start Time:</span> {starttime}</div>
      <div className="paddleRow"><span className="paddleLabel">End Time:</span> {endtime}</div>
      <div className="paddleRow"><span className="paddleLabel">Status:</span> <span className={`paddleStatus paddleStatus${status.replace(/\s/g, '')}`}>{status}</span></div>
    </div>
  );
}

export default Paddle; 