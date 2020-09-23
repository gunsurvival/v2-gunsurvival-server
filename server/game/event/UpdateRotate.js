/**
 * Update angle of player
 *
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {Number} userData.rotate - New angle of sprite
 */
const UpdateRotate = (server, socket, {rotate} = {}) => {
	const room = server.getRoomBySocketID(socket.id);
	if (!room || isNaN(rotate)) return;
	const sprite = room.game.spriteManager.find({id: socket.id});
	if (sprite) {
		room.game.updateRotate(sprite, rotate);
	}
};

export default UpdateRotate;
