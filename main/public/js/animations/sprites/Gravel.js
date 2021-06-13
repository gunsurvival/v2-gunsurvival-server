import {random} from "../../helper/helper.js";
import Sprite from "./Sprite.js";

class Gravel extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Gravel" + random(1, 3, true)
			},
			config
		);
		super(config);
		this.triggerFrame = 100 + random(0, 300, true);
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
			if (this.shakeFrame > 25) this.scale += 0.007;
			else this.scale -= 0.007;
			if (this.shakeFrame < 0) this.isShaking = false;
		}
	}

	draw(s) {
		super.draw(s);
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.rotate(this.rotate);
		s.scale(this.scale);
		s.image(window.GameImages[this.name], 0, 0);
		s.pop();
	}

	shake() {
		this.shakeFrame = 50;
		this.isShaking = true;
	}
}

export default Gravel;
