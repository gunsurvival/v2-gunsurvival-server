import Sprite from "./Sprite.js";

class BoxNormal extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "BoxNormal",
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
		s.image(window.GameImages.BoxNormal, 0, 0);
		s.pop();
	}
}

export default BoxNormal;
