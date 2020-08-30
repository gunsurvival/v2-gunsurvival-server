import Sprite from "./Sprite.js";
import * as Matter from "matter-js";
import random from "random";

class Score extends Sprite {
	constructor(config) {
		config = Object.assign(
			{
				name: "Score"
			},
			config
		);
		super(config);
		const {value, matterBodyConfig} = config;
		this.value = value;
		this._value = 10;
		const mbc = matterBodyConfig;
		this.matterBody = Matter.Bodies.circle(
			mbc.position.x,
			mbc.position.y,
			this._value,
			mbc
		);
		Matter.Body.scale(this.matterBody, this.getScale());
	}

	getScale() {
		return this.value / this._value;
	}

	getSpeed() {
		return (this._value / this.value) * 2;
	}

	update() {
		const speed = this.getSpeed();
		const crPos = this.matterBody.position; // current position
		this.matterBody.velocity.x += random.float(-speed, speed);
		this.matterBody.velocity.y += random.float(-speed, speed);
		// Matter.Body.set(this.matterBody, {
		// 	position: {
		// 		x: crPos.x + random.float(-speed, speed),
		// 		y: crPos.y + random.float(-speed, speed)
		// 	}
		// });
	}

	collide(object) {
		switch (object.origin.type) {
			case "Rock": {
				let vectorRockMe = {
					x: this.pos.x - object.origin.pos.x,
					y: this.pos.y - object.origin.pos.y
				};
				let magNewVector = Math.sqrt(
					Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2)
				);
				let bulletSpeed = Math.sqrt(
					Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2)
				);
				let scale = bulletSpeed / magNewVector;
				let bounceFriction = 0.7;
				this.speed.x = vectorRockMe.x * scale * bounceFriction;
				this.speed.y = vectorRockMe.y * scale * bounceFriction;
				break;
			}
			case "Human":
				this.delete = true;
				break;
			case "Score":
			case "Bullet": {
				let newSpeed = {
					x: (object.copy.speed.x / 100) * 80,
					y: (object.copy.speed.y / 100) * 80
				};
				this.speed.x = newSpeed.x;
				this.speed.y = newSpeed.y;
				break;
			}
		}
	}
}

export default Score;
