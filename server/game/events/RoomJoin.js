const RoomJoin = (server, socket, {id} = {}) => {
	if (server.getRoomBySocketID(socket.id))
		return socket.emit("alert dialog", "Loi! Vui long thu lai sau . . ."); // neu da join roi thi huy bo
	const room = server.roomManager.find({id});
	if (!room)
		// khong tim thay phong
		return socket.emit("alert dialog", "Room not found!");

	room.socketJoin(socket)
		.then(() => {
			server._io.emit("updaterooms", room.getData()); // update room table
		})
		.catch(message => {
			socket.emit("alert dialog", message);
		});
};

export default RoomJoin;
