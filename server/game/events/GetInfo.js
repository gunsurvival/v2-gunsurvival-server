const GetInfo = (server, socket) => {
	const roomSettings = [];
	for (const room of server.roomManager.items)
		roomSettings.push(room.getData());
	socket.emit("GetInfo", roomSettings);
};

export default GetInfo;
