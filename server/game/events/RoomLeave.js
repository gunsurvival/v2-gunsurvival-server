const RoomLeave = (server, socket) => {
	server._emitter.emit("online", server.getOnline());
	const room = server.getRoomBySocketID(socket);
	if (!room) return;

	room.socketDisconnect(socket);
	if (room.playing.length <= 0) {
		// nếu ko có ai trong phòng thì xóa phòng
		server.destroyRoom(room);
	} else {
		room._emitter.emit("RoomLeave", socket.id);
		server._emitter.emit("GetInfo", room.getData());
	}
};

export default RoomLeave;
