import Animation from "../animations/Animation.js";
// import {random} from "../../helpers/common.js";

export default class Camera extends Animation {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Camera"
			},
			config
		);
		super(config);
		this.isShaking = false;
		// this.prefix = new SAT.Vector();
	}

	update(sketch) {
		super.update(sketch);
		sketch.translate(-this.pos.x, -this.pos.y);
		sketch.rotate(this.rotate);
		sketch.scale(this.scale);
		sketch.translate(sketch.width * 0.5, sketch.height * 0.5);
	}

	shake(noise) {
		if (this.isShaking) return;
		let cX = this.pos.x; // current X
		let cY = this.pos.y; // current Y
		// let random = [-1, 1][Random(0, 1, true)];
		this.pos.x = cX + random(-noise, noise);
		this.pos.y = cY + random(-noise, noise);
	}

	// Chuyển đổi vị trí thực của vật thể (theo hệ toạ độ của mapgame) về vị trí trên màn hình (theo hệ toạ độ màn hình)
	worldToScreen(worldPos, screenSize) {
		return {
			x: (worldPos.x - this.pos.x) * this.scale + screenSize.width * 0.5,
			y: (worldPos.y - this.pos.y) * this.scale + screenSize.height * 0.5
		};
	}

	// Ngược lại của worldToScreen()
	screenToWorld(screenSize, worldPos) {
		return {
			x: (worldPos.x - screenSize.width * 0.5) / this.scale + this.pos.x,
			y: (worldPos.y - screenSize.height * 0.5) / this.scale + this.pos.y
		};
	}
}
