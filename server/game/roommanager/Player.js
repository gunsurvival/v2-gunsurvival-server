class Player {
	constructor({id, _emitter, name = `Guest${Date.now()}`} = {}) {
		this.id = id;
		this._emitter = _emitter;
		this.name = name;
	}

	// joinRoom(room) {
	// 	if (room.isAvailable) {
	//
	// 	}
	// }
}

export default Player;
