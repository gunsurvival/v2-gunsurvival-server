const Pingms = (server, socket, {time} = {}) => {
	// check form
	time = parseInt(time);
	if (isNaN(time))
		return;
	
	socket.emit("Pingms", time);
};

export default Pingms;
