class Player {
	constructor({id, _io, name = `Guest${Date.now()}`} = {}) {
		this.id = id;
		this._io = _io;
		this.name = name;
	}

	// joinRoom(room) {
	// 	if (room.isAvailable) {
	//
	// 	}
	// }
}

export default Player;
