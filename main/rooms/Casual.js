const Room = require('./Room');

module.exports = class Casual extends Room {
	constructor(options) {
		super(options);
	}

	async onCreate() {
		this.onMessage('change-weapon', (socket, data) => {});
	}

	nextTick() {}
};
