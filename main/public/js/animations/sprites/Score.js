import Sprite from "./Sprite.js";

class Score extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Score",
				infinite: true
			},
			config
		);
		super(config);
		const {_circleRadius = 10, value = 10} = config;
		this._circleRadius = _circleRadius;
		this.value = value;
	}

	update(s) {
		super.update(s);
		this.setScale(this.value / this._circleRadius);
	}

	draw(s) {
		super.draw(s);
		s.push();
		s.translate(this.pos.x, this.pos.y);
		s.stroke("gray");
		s.strokeWeight(4);
		s.fill("white");
		s.scale(this.scale);
		s.ellipse(0, 0, 10);
		s.pop();
	}

	onAlive({pos, value, _circleRadius} = {}) {
		this.setPos(pos);
		this.value = value;
		this._circleRadius = _circleRadius;
	}

	setPos(x, y) {
		super.setPos(x, y);
	}
}

export default Score;
