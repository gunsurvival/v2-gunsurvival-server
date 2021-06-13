const SAT = require('sat');
const Sprite = require('./Sprite');

module.exports = class Player extends Sprite {
	constructor(options) {
		super(options);
		const {speed = 6} = options;
		this.speed = speed;
		this.moving = {
			up: false,
			down: false,
			left: false,
			right: false
		};
	}

	nextTick() {
		this.pos.add(this.getSpeedV());
	}

	getSpeedV() {
		return new SAT.Vector(
			this.moving.left ? -1 : this.moving.right ? 1 : 0,
			this.moving.up ? -1 : this.moving.down ? 1 : 0
		).scale((1 / Math.sqrt(2)) * this.speed * (32 / this.room.gameServer.tps));
	}
};
