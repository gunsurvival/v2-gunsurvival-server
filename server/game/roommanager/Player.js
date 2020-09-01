class Player {
	constructor({_socket, id, name = `Guest${Date.now()}`} = {}) {
		this._socket = _socket;
		this.id = id;
		this.name = name;
	}

	getData() {
		return {
			id: this.id,
			name: this.name
		}
	}

	// joinRoom(room) {
	// 	if (room.isAvailable) {
	//
	// 	}
	// }
}

export default Player;
