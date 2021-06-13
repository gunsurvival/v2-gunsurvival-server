import Middleware from "./Middleware.js";

export default class Bloodbar extends Middleware {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Bloodbar"
			},
			config
		);
		super(config);
		const {width = 350, height = 30, y = 800} = config;
		this.maxBlood = 100;
		this.blood = 100;
		this.toBlood = 100;
		this.timeOut;
		this.width = width;
		this.height = height;
		// this.y = HEIGHT - 130;
		this.y = y;
	}

	reset() {
		this.maxBlood = 100;
		this.updateBlood(100);
	}

	updateBlood(blood) {
		if (blood < 0) blood = 0;
		this.toBlood = blood;
		if (blood > this.maxBlood) {
			this.maxBlood = blood;
		}
	}

	update(s) {
		this.blood = s.lerp(this.blood, this.toBlood, 0.1);
	}

	draw(s) {
		s.push();
		s.noStroke();
		s.rectMode(s.CENTER);
		s.fill("#474747");
		s.stroke("#212121");
		s.strokeWeight(5);
		s.rect(s.width / 2, this.y, this.width + 5, this.height + 5, 20, 20);

		s.rectMode(s.CORNER);
		s.fill("red");
		s.strokeWeight(0);
		s.rect(
			s.width / 2 - this.width / 2,
			this.y - this.height / 2,
			(this.width * this.blood) / this.maxBlood,
			this.height,
			20,
			20
		);

		s.textAlign(s.CENTER, s.CENTER);
		s.stroke("white");
		s.fill("white");
		s.text(`${Math.round(this.blood)} / ${this.maxBlood}`, s.width / 2, this.y);
		s.pop();
	}
}

export default Bloodbar;
