import Sprite from "./Sprite.js";

class Door extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Door",
				infinite: true
			},
			config
		);
		super(config);
	}

	draw(s) {
		super.draw(s);
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.rotate(this.rotate);
		s.scale(this.scale);
		s.image(window.GameImages[this.imageName], 0, 0);
		s.pop();
	}
}

export default Door;
