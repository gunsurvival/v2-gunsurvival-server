const UpdateLogkm = (server, socket, {keyCode, value} = {}) => {
	// check form
	keyCode = parseInt(keyCode);
	value = Boolean(value);
	
	const room = server.getRoomBySocketID(socket.id);
	if (!room || isNaN(keyCode)) return;

	const sprite = room.game.spriteManager.find({id: socket.id});
	if (sprite) {
		const logkm = sprite.logkmManager.find({keyCode}); // logkmManager is log keyboard/mouse manager

		if (logkm) {
			logkm.value = value;
		} else {
			sprite.logkmManager.add({
				keyCode,
				value
			});
			console.log(keyCode)
		}
	}
};

export default UpdateLogkm;
