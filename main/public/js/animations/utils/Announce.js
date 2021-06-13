import Middleware from "./Middleware.js";

export default class Announce extends Middleware {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Announce"
			},
			config
		);
		super(config);
		this.x = 0;
		this.y = 50;
		this.queue = [];
	}

	update(s) {
		if (this.queue.length == 0) return;
		if (this.x == "done") this.x = -s.textWidth(this.queue[0]);
		this.x += s.width * 0.002;
		if (this.x > s.width) {
			this.queue.splice(0, 1);
			this.x = "done";
		}
	}

	draw(s) {
		if (this.x == "done") return;
		s.push();
		s.textSize(20);
		s.text(this.queue[0], this.x, this.y);
		s.pop();
	}

	add(text) {
		this.queue.push(text);
	}
}

export default Announce;
