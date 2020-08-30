import logger from "node-color-log";

const Disconnect = (server, socket) => {
	logger.info(`1 player disconnected! Online(s): ${server.getOnline()}`);
	server._emitter.emit("online", server.getOnline());

	const room = server.getRoomBySocketID(socket.id);
	if (!room)
		return socket.emit("dialog alert", "Loi! Khong tim thay phong . . .");

	room.disconnectSocket(socket);

	if (room.playing.length <= 0) {
		// nếu ko có ai trong phòng thì xóa phòng
		server.destroyRoom(room);
	} else {
		room._emitter.emit("RoomLeave", socket.id);
		server._emitter.emit("GetInfo", room.getData());
	}
};

export default Disconnect;
