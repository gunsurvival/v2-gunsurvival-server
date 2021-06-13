import {random} from "../../helper/helper.js";
import Sprite from "./Sprite.js";

class Leaf extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Leaf" + random(1, 3, true),
				infinite: true
			},
			config
		);
		super(config);
		this.triggerFrame = 100 + Math.round(random(0, 300));
		this.isShaking = false;
		this.shakeFrame = 0;
	}

	update(s) {
		super.update(s);
		if (this.frameCount % this.triggerFrame == 0) {
			this.shake();
		}
		if (this.isShaking) {
			this.shakeFrame--;
			if (this.shakeFrame > 25) this.rotate += 0.012;
			else this.rotate -= 0.012;
			if (this.shakeFrame < 0) this.isShaking = false;
		}
	}

	draw(s) {
		super.draw(s);
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.rotate(this.rotate);
		s.image(window.GameImages[this.name], 0, 0, 40, 40);
		s.pop();
	}

	shake() {
		this.shakeFrame = 50;
		this.isShaking = true;
	}
}

export default Leaf;
