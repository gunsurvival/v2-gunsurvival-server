const RoomJoin = (server, socket, {id} = {}) => {
	if (server.getRoomBySocketID(socket))
		return socket.emit("dialog alert", "Loi! Vui long thu lai sau . . ."); // neu da join roi thi huy bo
	const room = server.roomManager.find({id});
	if (!room)
		// khong tim thay phong
		return socket.emit("dialog alert", "Room not found!");

	room.socketJoin(socket)
		.then(() => {
			server._emitter.emit("GetInfo", room.getData()); // update room table
		})
		.catch(message => {
			socket.emit("dialog alert", message);
		});
};

export default RoomJoin;
