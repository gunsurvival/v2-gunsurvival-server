/**
 * Ping pong
 *
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {Number} userData.time - Current Date.now() on client-side (not server-side)
 */
const Pingms = (server, socket, {time} = {}) => {
	// check form
	time = parseInt(time);
	if (isNaN(time))
		return;
	
	socket.emit("Pingms", time);
};

/**
 * @module Event
 */
export default Pingms;
