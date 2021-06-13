import Sprite from "./Sprite.js";
import {images} from "../../globals/asset.global.js";

export default class Player extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Gunner#" + config.id,
				infinite: true,
				speedRotate: 0.3
			},
			config
		);
		super(config);
		const {name = "Unknown Player"} = config;
		this.dead = false;
	}

	update(sketch) {
		super.update(sketch);

		this.rotateTo(
			sketch.atan2(
				sketch.mouseY - sketch.height / 2,
				sketch.mouseX - sketch.width / 2
			)
		);

		sketch.translate(this.pos.x, this.pos.y);
		sketch.textAlign(sketch.CENTER, sketch.CENTER);
		sketch.textSize(18); // draw name
		sketch.stroke("white");
		sketch.strokeWeight(1);
		sketch.fill("white");
		sketch.text(this.name, 0, -60);

		const img = images["Gunner.png"];
		sketch.rotate(this.angle);
		sketch.image(img, 0, 0);

		return;

		if (!this.dead) {
			// vẫn còn sống
			sketch.ellipse(this.pos.x, this.pos.y, 40);
			sketch.pop();
			return;
		} else {
			sketch.image(window.GameImages["GunnerDead"], 0, 0, 80, 80);
		}
	}

	onUpdate({angle, pos, tick} = {}) {
		// debugger;
		if (this.frameCount - tick > 10) {
			console.log("server: " + tick);
			console.log("client: " + this.frameCount);
			return;
		}
		this.frameCount = tick;
		// this.rotateTo(angle);
		console.log(angle);
		this.moveTo(pos);
	}
}
