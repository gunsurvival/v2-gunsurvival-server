import Sprite from "./Sprite.js";

class RoofBrown extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "RoofBrown",
				infinite: true
			},
			config
		);
		super(config);
	}

	update(s) {
		super.update(s);
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
}

export default RoofBrown;
