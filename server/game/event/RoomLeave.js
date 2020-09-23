/**
 * Leaving a game room
 *
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 */
const RoomLeave = (server, socket) => {
	server._io.emit("online", server.getOnline());
	const room = server.getRoomBySocketID(socket.id);
	if (!room) return;

	room.socketDisconnect(socket);
	if (room.playing.length <= 0) {
		// nếu ko có ai trong phòng thì xóa phòng
		server.destroyRoom(room);
	} else {
		room._io.to(room.id).emit("RoomLeave", socket.id);
		server._io.emit("roomupdates", room.getData());
	}
};

export default RoomLeave;
