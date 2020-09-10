const UpdateRotate = (server, socket, {rotate} = {}) => {
	const room = server.getRoomBySocketID(socket.id);
	if (!room || isNaN(rotate)) return;
	const sprite = room.game.spriteManager.find({id: socket.id});
	if (sprite) {
		room.game.updateRotate(sprite, rotate);
	}
};

export default UpdateRotate;
