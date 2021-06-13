import Middleware from "./Middleware.js";

export default class Hotbar extends Middleware {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Hotbar"
			},
			config
		);
		super(config);
		const {
			items = [],
			choosing = 0,
			bottom = 40,
			margin = 25,
			boxSize = 55
		} = config;
		this.items = items; // balo
		this.choosing = choosing; // vũ khí đang chọn
		this.bottom = bottom; // vị trí ô chọn súng
		this.margin = margin; // khoảng cách các ô chọn súng
		this.boxSize = boxSize; // size của ô chọn súng
	}

	update(s) {
		super.update(s);
		// if (collidePointRect(mouseX, mouseY, this.getStartX(), (HEIGHT - this.bottom) - this.boxSize/2, hotbar.getBarWidth(), hotbar.boxSize)) {
		// 	cursor('POINTER');
		// }
	}

	getBarWidth() {
		return this.items.length * (this.boxSize + this.margin) - this.margin;
	}

	getStartX() {
		return innerWidth / 2 - this.getBarWidth() / 2 + this.boxSize / 2;
	}

	wheel(delta) {
		const chooseIndex = this.choosing + delta / Math.abs(delta);
		this.choose(chooseIndex);
	}

	draw(s) {
		s.push();
		s.rectMode(s.CENTER);
		s.imageMode(s.CENTER);
		s.strokeWeight(4);
		let index = 0;
		// const widthBar = this.getBarWidth();
		const startX = this.getStartX();
		for (const e of this.items) {
			// >> rectMode(CENTER) <<
			const box = {
				x: startX + index * (this.boxSize + this.margin),
				y: s.height - this.bottom
			};
			// const scale;
			if (this.choosing == index) {
				s.stroke("#f5f5f5");
				s.fill("#f5f5f5");
				s.rect(box.x, box.y, this.boxSize + 10, this.boxSize + 10, 10);
				// scale = (this.boxSize + 10 - 5) / images[e.name].width;
			} else {
				s.stroke("#e0e0e0");
				s.fill("#858585");
				s.rect(box.x, box.y, this.boxSize, this.boxSize, 10);
				// scale = (this.boxSize - 5) / images[e.name].width;
			}
			// image(images[e.name], box.x, box.y, images[e.name].width * scale, images[e.name].height * scale);
			index++;
		}
		s.pop();
	}

	choose(index, socket) {
		this.choosing = index;
		if (this.choosing < 0) this.choosing = 0;
		if (this.choosing > this.items.length - 1)
			this.choosing = this.items.length - 1;
		socket.emit("weapon change", this.choosing);
	}

	click(x, y, s) {
		// const widthBar = this.getBarWidth();
		const startX = this.getStartX();
		const index = 0;
		for (const e of this.items) {
			// >> rectMode(CORNER) <<
			// const box = {
			// 	x: startX + index * (this.boxSize + this.margin) - this.boxSize / 2,
			// 	y: s.height - this.bottom - this.boxSize / 2
			// };
			// if (collidePointRect(x, y, box.x, box.y, this.boxSize, this.boxSize)) {
			// 	this.choose(index);
			// 	socket.emit("weapon change", index);
			// 	break;
			// }
			index++;
		}
	}

	reset() {
		this.items.splice(0, this.items.length);
		this.choosing = 0;
	}
}

export default Hotbar;
