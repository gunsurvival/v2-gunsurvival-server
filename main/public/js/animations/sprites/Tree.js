import Sprite from "./Sprite.js";

class Tree extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Tree",
				infinite: true
			},
			config
		);
		super(config);
		const {
			hideCount = 0
		} = config;
		this.hideCount = hideCount;
		this.toggleShake = "up";
	}

	update(s) {
		super.update(s);
		if (this.hideCount < 0) this.hideCount = 0;
	}

	draw(s) {
		super.draw(s);
		if (this.hideCount > 0) {
			if (this.toggleShake == "up") this.setRotate(this.targetRotate - 1);
			if (this.toggleShake == "down")
				this.setRotate(this.targetRotate + 1);
			if (this.rotate <= this._rotate - 0.12) this.toggleShake = "down";
			if (this.rotate >= this._rotate + 0.12) this.toggleShake = "up";
		} else {
			this.setRotate(this._rotate);
			this.speedRotate = 0.0017;
		}
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.rotate(this.rotate);
		s.scale(this.scale);
		s.image(window.GameImages[this.name], 0, 0);
		s.pop();
		// if (this.mode != "draw") {
		// 	let me = gunners[gunners.findIndex(e => e.id == socket.id)];
		// 	if (me && collideCircleCircle(this.pos.x, this.pos.y, 200 * this.size - 120, me.pos.x, me.pos.y, 80)) {
		// 		image(this.img.tint, 0, 0);
		// 	} else {
		// 		image(this.img, 0, 0);
		// 	}
		// } else
	}

	onAlive({pos, hideCount} = {}) {
		this.setPos(pos);
		this.hideCount = hideCount;
	}
}

export default Tree;
