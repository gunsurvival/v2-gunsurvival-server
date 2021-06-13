const SAT = require('sat');
const uniqid = require('uniqid');

module.exports = class Sprite {
	constructor({
		room,
		id = uniqid(),
		pos = new SAT.Vector(0, 0),
		angle = 0
	} = {}) {
		this.room = room;
		this.id = id;
		this.pos = pos;
		this.angle = angle;
		this.tick = 0;
	}

	emit(eventName, ...args) {
		this.room.gameServer.io.to(this.id).emit(eventName, ...args);
	}

	nextTick() {}

	getMetadata() {
		return {
			className: this.constructor.name,
			id: this.id,
			pos: this.pos,
			angle: this.angle,
			tick: this.tick
		};
	}

	destroy() {
		this.deleted = true;
	}
};
