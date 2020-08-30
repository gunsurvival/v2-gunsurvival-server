const Pingms = (server, socket, {time} = {}) => {
	socket.emit("Pingms", time);
};

export default Pingms;
