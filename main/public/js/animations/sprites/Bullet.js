import Sprite from "./Sprite.js";

class Bullet extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Bullet",
				liveTime: 40,
				smoothRotate: false,
				speedRotate: 0.06,
				speedPos: 0.5
			},
			config
		);
		super(config);
		const {ownerID} = config;
		this.ownerID = ownerID;
	}

	update(s) {
		super.update(s);
		const newRotate = s.atan2(this.targetPos.y - this.pos.y, this.targetPos.x - this.pos.x);
		if (newRotate != 0)
			this.setRotate(newRotate);
	}

	draw(s) {
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.rotate(this.rotate);
		s.scale(this.scale);
		s.image(window.GameImages[this.name], 0, 0);
		s.pop();
	}

	moveTo(pos) {
		this.setPos(pos);
		this.resetLifeTime();
	}

	resetLifeTime() {
		this.liveTime = 40;
	}

	onBorn() {

	}

	onAlive({pos} = {}) {
		this.moveTo(pos);
	}
}

export default Bullet;
