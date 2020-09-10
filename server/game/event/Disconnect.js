import logger from "node-color-log";

const Disconnect = (server, socket) => {
	logger.info(`1 player disconnected! Online(s): ${server.getOnline()}`);
	server._io.emit("online", server.getOnline());

	const room = server.getRoomBySocketID(socket.id);
	if (!room)
		return socket.emit("alert dialog", "Loi! Khong tim thay phong . . .");

	room.socketDisconnect(socket);

	if (room.playerManager.getLength() <= 0) {
		// nếu ko có ai trong phòng thì xóa phòng
		server.destroyRoom(room);
	} else {
		room._io.to(room.id).emit("Disconnect", socket.id);
	}
	server._io.emit("updaterooms", room.getData());
};

export default Disconnect;
